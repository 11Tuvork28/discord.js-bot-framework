import {
  Button,
  Flex,
  Heading,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  chakra,
  useBreakpointValue,
  Image,
} from '@chakra-ui/react';
import { FC, PropsWithChildren, ReactElement } from 'react';
import {
  HiCog,
  HiEllipsisVertical,
  HiFlag,
  HiHome,
  HiQueueList,
  HiArrowLeftOnRectangle,
} from 'react-icons/hi2';
import {
  Link,
  Link as RouterLink,
  useLocation,
  useResolvedPath,
} from 'react-router-dom';
import { useIsAuthenticated } from '../hooks/state/use-is-authenticated.tsx';
import { useSelf } from '../hooks/state/use-self.tsx';
import { useIsMod } from '../hooks/state/use-is-mod.tsx';
import { useLogout } from '../hooks/state/use-logout.tsx';

const RouterLinkButton: FC<
  PropsWithChildren<{ to: string; icon: ReactElement }>
> = ({ to, icon, children }) => {
  const path = useResolvedPath(to);
  const location = useLocation();
  const isActive = location.pathname === path.pathname;
  const size = useBreakpointValue(
    {
      base: 'sm',
      sm: 'md',
    },
    { fallback: 'sm' },
  );

  return (
    <Button
      to={to}
      variant="link"
      as={RouterLink}
      disabled={isActive}
      leftIcon={icon}
      color={isActive ? 'primary.300' : 'primary.50'}
      size={size}
    >
      {children}
    </Button>
  );
};

export const Header: FC = () => {
  const isAuthenticated = useIsAuthenticated();
  const self = useSelf();
  const isMod = useIsMod();
  const logout = useLogout();
  const displayTitle = useBreakpointValue(
    {
      base: 'none',
      md: 'initial',
    },
    { fallback: 'md' },
  );
  const gap = useBreakpointValue(
    {
      base: '2',
      sm: '4',
    },
    { fallback: 'sm' },
  );

  return (
    <chakra.header
      display="flex"
      backgroundColor="whiteAlpha.100"
      padding="4"
      gap={gap}
      flexWrap="wrap"
      alignItems="center"
    >
      <Heading size="md" display={displayTitle}>
        🐶 Cardinal System
      </Heading>
      {isAuthenticated && (
        <>
          <Flex height="100%" alignItems="center" gap={gap} flexGrow={1}>
            <RouterLinkButton to="/" icon={<Icon as={HiHome} />}>
              Dashboard
            </RouterLinkButton>
            <RouterLinkButton to="/audit" icon={<Icon as={HiQueueList} />}>
              Audit
            </RouterLinkButton>
            <RouterLinkButton to="/moderation" icon={<Icon as={HiFlag} />}>
              Moderation
            </RouterLinkButton>
          </Flex>
          <Flex height="100%">
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="More"
                borderRadius="50%"
                icon={
                  self?.avatarUrl ? (
                    <Image
                      src={self.avatarUrl}
                      alt="More"
                      borderRadius="50%"
                      width="calc(100% - .2rem)"
                      height="calc(100% - .2rem)"
                    />
                  ) : (
                    <Icon as={HiEllipsisVertical} />
                  )
                }
                variant="ghost"
                color="primary.50"
              />
              <MenuList>
                {isMod && (
                  <MenuItem icon={<HiCog />} as={Link} to="/settings">
                    Settings
                  </MenuItem>
                )}
                <MenuItem
                  icon={<HiArrowLeftOnRectangle />}
                  onClick={() => logout()}
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </>
      )}
    </chakra.header>
  );
};
