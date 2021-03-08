import * as React from 'react';
import { useRouter } from 'next/router';
import Menu from '@geist-ui/react-icons/menu';
import Dismiss from '@geist-ui/react-icons/x';

import { Button } from '$/components/Button';
import { Link } from '$/components/Link';
import LogOut from '@geist-ui/react-icons/logOut';
import { Avatar } from '$/components/Avatar';
import { useCurrentUser } from '$/hooks/useCurrentUser';
import { Select } from '$/components/Select';
import { SlashIcon } from '$/components/Icons/SlashIcon';
import { CurrentUserContextType } from '$/context/CurrentUserContext';

import styles from './style.module.scss';
import clsx from 'clsx';
import { Logo } from '../Logo';
import { IconButton } from '../Button';
import { SpinnerIcon } from '../Icons';
import { DropDownMenu } from '../DropDownMenu';

const SELECTED_PROJECT_ID = 'SELECTED_PROJECT_ID';
type Project = NonNullable<NonNullable<CurrentUserContextType['projects']>[number]>;

export function Header(): JSX.Element {
  const { projects, displayName, avatar, error, loading: signInLoading } = useCurrentUser();
  const [selectedProject, setSelectedProject] = React.useState<Project>();
  React.useEffect(() => {
    if (projects?.length && !selectedProject) {
      const lastSelectedProject = localStorage.getItem(SELECTED_PROJECT_ID);
      setSelectedProject(
        projects.find((project: Project) => project.id === lastSelectedProject) || projects[0],
      );
    }
  }, [projects, selectedProject]);
  const handleSelectProject = React.useCallback(
    (projectID: string) => {
      setSelectedProject(projects?.find((project: Project) => project.id === projectID));
      localStorage.setItem(SELECTED_PROJECT_ID, projectID);
    },
    [projects],
  );

  const [showMenu, setShowMenu] = React.useState(false);
  const handleClickMenu = React.useCallback(() => {
    setShowMenu((prev) => !prev);
  }, []);

  const router = useRouter();

  if (error) {
    console.error('Get current user error:', error);
  }
  return (
    <header
      className={clsx(
        'w-full py-5 transition duration-150 border-b sm:sticky sm:top-0 sm:left-0 border-gray-300 dark:border-gray-700 sm:z-20',
        styles.header,
      )}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <section className="flex flex-row items-center justify-between">
          <div className="flex items-center sm:hidden pl-3">
            <IconButton size="sm" aria-expanded={false} onClick={handleClickMenu}>
              <span className="sr-only">Open navigation menu</span>
              <Menu className={clsx({ hidden: showMenu })} />
              <Dismiss className={clsx({ hidden: !showMenu })} />
            </IconButton>
          </div>
          <div className="flex flex-row sm:items-stretch sm:justify-start">
            <div className="flex flex-row items-center space-x-2">
              <Logo />
              {router.pathname === '/dashboard' && !!projects?.length && selectedProject && (
                <>
                  <SlashIcon className="text-gray-400" />
                  <Select
                    value={selectedProject?.id}
                    name={selectedProject?.name}
                    onChange={handleSelectProject}
                    className="w-32 sm:w-40"
                  >
                    {projects.map((project: Project) => (
                      <Select.Option key={project.id} value={project.id}>
                        {project.name}
                      </Select.Option>
                    ))}
                  </Select>
                </>
              )}
            </div>
            <nav className="w-full hidden sm:flex flex-wrap items-center mb-5 space-x-5 sm:mb-0 sm:pl-8 sm:ml-8 sm:border-l sm:border-gray-200">
              <Link href="/" className="" highlightMatch>
                Home
              </Link>
              <Link href="/doc" className="" highlightMatch>
                Doc
              </Link>
              <Link href="/pricing" className="" highlightMatch>
                Pricing
              </Link>
              <Link href="/blog" className="" highlightMatch>
                Blog
              </Link>
            </nav>
          </div>
          <div className="flex">
            {displayName ? (
              <DropDownMenu content={<Avatar src={avatar} alt={`The avatar of ${displayName}`} />}>
                <DropDownMenu.Item className="justify-end space-x-2">
                  <Link
                    href="/api/auth/logout"
                    variant="plain"
                    className="flex flex-row items-center space-x-1"
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </Link>
                </DropDownMenu.Item>
                {/* <Divider /> */}
              </DropDownMenu>
            ) : (
              <div className="flex flex-row items-center space-x-2">
                <Link href="/sign-in" variant="plain" disableUnderline>
                  <Button color="gray" variant="plain" className="space-x-1">
                    {signInLoading && <SpinnerIcon className="text-gray-400" />}
                    <span>Sign in</span>
                  </Button>
                </Link>
                <Link href="/sign-up" variant="plain" disableUnderline>
                  <Button color="purple" variant="solid">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
      <div className="w-full">
        <nav
          className={clsx('flex w-full flex-col px-2 pt-2 pb-3 space-y-1', { hidden: !showMenu })}
        >
          <Link href="/" className="px-3 py-2" highlightMatch>
            Home
          </Link>
          <Link href="/doc" className="px-3 py-2" highlightMatch>
            Documents
          </Link>
          <Link href="/pricing" className="px-3 py-2" highlightMatch>
            Pricing
          </Link>
          <Link href="/blog" className="px-3 py-2" highlightMatch>
            Blog
          </Link>
        </nav>
      </div>
    </header>
  );
}
