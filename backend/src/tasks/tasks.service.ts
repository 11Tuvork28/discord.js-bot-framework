import { InjectDiscordClient } from '@discord-nestjs/core';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { User } from '@prisma/client';
import { Client } from 'discord.js';
import { AuditLogService } from 'src/auditlog/auditlog.service';
import { BotService } from 'src/bot/bot.service';
import LogEntry from 'src/entities/logEntry';
import { UserService } from 'src/user/user.service';

const logger = new Logger('TaskService');

@Injectable()
export class TasksService {
  constructor(
    @Inject(BotService) private botService: BotService,
    @Inject(UserService) private userService: UserService,
    @InjectDiscordClient()
    private readonly client: Client,
    @Inject(AuditLogService) private auditLogService: AuditLogService,
  ) {}

  @Cron('0 0 * * *', {
    name: 'checkActiveUsers',
    timeZone: 'Europe/Berlin',
  })
  async checkActiveUsers() {
    this.client.guilds.cache.forEach(async (guild) => {
      (await this.userService.findAll(guild.id)).forEach(async (user: User) => {
        if (user.rank != ('MEMBER' || 'NEW')) return;
        logger.log(`Checking user ${user.userId} for activity...`);
        this.userService.updateMessageCountBucket(user);
        this.botService.updateChannelPermissions(user);
      });
    });
  }

  // Run every 5 minutes
  @Cron('*/5 * * * *', {
    name: 'timeouts',
    timeZone: 'Europe/Berlin',
  })
  async checkTimeouts() {
    this.client.guilds.cache.forEach(async (guild) => {
      (await this.userService.findAll(guild.id)).forEach(
        async (dbUser: User) => {
          const member = await this.client.guilds.cache
            .get(guild.id)
            .members.fetch(dbUser.userId.toString());
          if (member.communicationDisabledUntilTimestamp == null) {
            logger.log(`User ${dbUser.userId} has no timeout.`);
            return;
          } else if (member.communicationDisabledUntilTimestamp > Date.now()) {
            logger.log(`User ${dbUser.userId} is still timed out.`);
            return;
          } else if (member.communicationDisabledUntilTimestamp < Date.now()) {
            logger.log(`User ${dbUser.userId} timeout expired.`);
            const logEntry: LogEntry = {
              guildId: guild.id,
              invokerId: '0',
              action: 'TIMEOUT_EXPIRED',
              reason: 'Timeout expired',
              createdAt: new Date(),
              targetId: dbUser.userId.toString(),
              targetType: 'USER',
              extraInfo: JSON.stringify({
                timeout: member.communicationDisabledUntilTimestamp,
              }),
            };
            await this.auditLogService.create(logEntry);
          }
        },
      );
    });
  }
}
