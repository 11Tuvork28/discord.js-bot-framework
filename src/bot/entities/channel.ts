import { ApiProperty } from '@nestjs/swagger';

class PermissionOverwrite {
  @ApiProperty({ description: 'ID of the permission overwrite' })
  id: string;
}

class Channel {
  @ApiProperty({ description: 'Type of the channel', type: Number })
  type: number;

  @ApiProperty({
    description: 'ID of the guild',
    example: '616609333832187924',
  })
  guildId: string;

  @ApiProperty({
    description: 'Array of permission overwrites',
    type: [PermissionOverwrite],
  })
  permissionOverwrites?: PermissionOverwrite[];

  @ApiProperty({
    description: 'Array of message IDs',
    type: [String],
    example: [],
  })
  messages?: string[];

  @ApiProperty({
    description: 'Array of thread IDs',
    type: [String],
    example: [],
  })
  threads?: string[];

  @ApiProperty({ description: 'Whether the channel is NSFW', example: false })
  nsfw?: boolean;

  @ApiProperty({ description: 'Flags for the channel', example: 0 })
  flags: number;

  @ApiProperty({
    description: 'ID of the channel',
    example: '1056592866660581456',
  })
  id: string;

  @ApiProperty({ description: 'Name of the channel', example: 'images' })
  name: string;

  @ApiProperty({ description: 'Raw position of the channel', example: 3 })
  rawPosition: number;

  @ApiProperty({
    description: 'ID of the parent channel',
    example: '832170662491062333',
  })
  parentId: string;

  @ApiProperty({ description: 'Topic of the channel', example: null })
  topic?: string;

  @ApiProperty({
    description: 'ID of the last message',
    example: '1080070968900333578',
  })
  lastMessageId?: string;

  @ApiProperty({ description: 'Rate limit per user', example: 0 })
  rateLimitPerUser?: number;

  @ApiProperty({
    description: 'Timestamp when the channel was created',
    example: 1671981769958,
  })
  createdTimestamp: number;
}
export { Channel };
