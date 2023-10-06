import { Inject, Injectable, UseGuards } from '@nestjs/common';
import { Once, InjectDiscordClient, On } from '@discord-nestjs/core';
import {
  Client,
  GuildMember,
  GuildTextBasedChannel,
  Message,
} from 'discord.js';
import { UserService } from 'src/users/user.service';
import { MessageFromUserGuard } from './guards/message-from-user.guard';
import { IsUserUnlockedGuard } from './guards/user-is-unlocked.guard';
import { ChannelIdGuard } from './guards/message-in-channel.guard';
import { ConfigService } from '@nestjs/config';
import { BotService } from './bot.service';
@Injectable()
export class BotGateway {
  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
    @Inject(UserService) private readonly userService: UserService,
    @Inject('ConfigService') private readonly configService: ConfigService,
    @Inject('BotService') private readonly discordService: BotService,
  ) {}

  @Once('ready')
  async onReady() {
    const members = await this.client.guilds.cache.at(0).members.fetch();
    members.forEach(async (member: GuildMember) => {
      if (!member.user.bot)
        await this.userService.findOrCreate(
          parseInt(member.id),
          member.user.username,
        );
    });
  }

  @On('guildMemberAdd')
  async addMember(member: GuildMember) {
    await this.userService.findOrCreate(
      parseInt(member.id),
      member.user.username,
    );
  }

  @On('guildMemberRemove')
  async removeMember(member: GuildMember) {
    await this.userService.deleteOne(parseInt(member.id));
    // remove all roles from user to avoid this: https://canary.discord.com/channels/1011511871297302608/1011527466130608171/1155900698257539202
    // THis probably errors out quite often though
    try {
      await member.roles.remove(member.roles.cache);
    } catch (e) {
      console.log(e);
    }
  }
  @On('messageCreate')
  @UseGuards(MessageFromUserGuard, IsUserUnlockedGuard)
  async onMessage(message: Message): Promise<void> {
    await this.userService.insertMessage(
      parseInt(message.author.id),
      parseInt(message.id),
      parseInt(message.guildId),
    );
  }

  @On('messageCreate')
  @UseGuards(MessageFromUserGuard, ChannelIdGuard('1055422746596737094'))
  async postIntroductionFromUser(message: Message): Promise<void> {
    // Get first message from user in the introduction channel and post it to the open introduction channel
    const messages = await message.channel.messages.fetch({ limit: 1 });
    const firstMessage = messages.first();
    await this.userService.setFirstMessageId(
      firstMessage.id,
      firstMessage.author.id,
    );
    return;
  }

  @On('guildMemberUpdate')
  @UseGuards(MessageFromUserGuard)
  async unlockUser(member: GuildMember) {
    // check if wpf has been removed and user role has been added
    if (
      !member.roles.cache.has(this.configService.get('WPF_ROLE_ID')) &&
      member.roles.cache.has(this.configService.get('USER_ROLE_ID'))
    )
      return;
    await this.userService.unlockUser(member.id);
    // Post introduction message(firstmessage) to open introduction channel
    const stats = await this.userService.getStats(parseInt(member.id));
    if (stats.firstMessageId) {
      const channel = (await this.client.channels.fetch(
        this.configService.get('OPEN_INTRO_CHANNEL_ID'),
      )) as GuildTextBasedChannel;
      const message = await (
        this.client.guilds.cache
          .get(this.configService.get('GUILD_ID'))
          .channels.cache.get(
            this.configService.get('INTRO_CHANNEL_ID'),
          ) as GuildTextBasedChannel
      ).messages.fetch(stats.firstMessageId.toString());
      await channel.send(await this.discordService.templateMessage(message));
    }
  }
}
