import { useApi } from './use-api.tsx';
import { useEffect, useState } from 'react';
import { useGuildId } from '../state/use-guild-id.tsx';
import { APIGuildChannel, ChannelType } from '../../discord-api.ts';

export type Channel = APIGuildChannel<ChannelType>;
export const useGetChannels = () => {
  const api = useApi();
  const guildId = useGuildId();
  const [channels, setChannels] = useState<Channel[]>();
  useEffect(() => {
    if (!guildId) return;
    api
      .get(`/guild/${guildId}/moderation/channel`)
      .json<Channel[]>()
      .then((channels) => setChannels(channels));
  }, [guildId, api]);

  return channels;
};
