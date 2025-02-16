import { EMAIL_RE } from '@chirpy-dev/utils';
import * as React from 'react';

import { PageTitleDeprecated } from '../../../blocks';
import {
  Avatar,
  Button,
  FormField,
  Heading,
  IconEdit2,
  IconLink2,
  IconSave,
  IconTrash2,
  IconTwitter,
  Input,
  Link,
  Popover,
  Spinner,
  Text,
  TextArea,
  useToast,
} from '../../../components';
import { useCurrentUser } from '../../../contexts';
import { useForm } from '../../../hooks';
import { logger } from '../../../utilities';
import { trpcClient } from '../../../utilities/trpc-client';
import { AppLayout } from '../components/app-layout';

type FormFields = {
  name: string;
  email: string;
  bio: string;
  website: string;
  twitter: string;
};

export function Profile(): JSX.Element {
  const { isSignIn, refetchUser } = useCurrentUser();
  const {
    data,
    isFetching,
    refetch: refetchProfile,
  } = trpcClient.user.myProfile.useQuery();
  const {
    name,
    email,
    bio,
    website,
    twitterUserName,
    image,
    username,
    emailVerified,
    kind,
  } = data || {};
  const isAnonymous = kind === 'ANONYMOUS';
  const [isEditMode, setIsEditMode] = React.useState(false);
  const { mutateAsync: updateProfile } =
    trpcClient.user.updateProfile.useMutation();

  const { register, errors, handleSubmit } = useForm<FormFields>({
    defaultValues: {
      name: name || '',
      email: email || '',
      bio: bio || '',
      website: website || '',
      twitter: twitterUserName || '',
    },
  });
  const { showToast } = useToast();
  const handleClickButton = handleSubmit(async (fields) => {
    if (isEditMode) {
      try {
        await updateProfile({
          name: fields.name,
          email: fields.email,
          bio: fields.bio,
          website: fields.website,
          twitterUserName: fields.twitter,
        });
      } catch (error) {
        if (error instanceof Error) {
          logger.error('Update user profile failed', error);
          if (error.message.includes(`Unique constraint`)) {
            showToast({
              type: 'error',
              title: `${fields.email} is in use`,
              description:
                'The email address you entered is already in use. Please try another one.',
            });
          } else {
            showToast({
              type: 'error',
              title:
                'Sorry, something wrong happened in our side, please try again later.',
            });
          }
          return;
        }
      }
      await Promise.all([refetchProfile(), refetchUser()]);
      setIsEditMode(false);
    } else {
      setIsEditMode(true);
    }
  });

  const handleClickDiscard = () => {
    setIsEditMode(false);
  };

  if (!isSignIn && isFetching) {
    return (
      <ProfileContainer>
        <Spinner className="mt-20 justify-center" />
      </ProfileContainer>
    );
  }

  return (
    <AppLayout title={name || 'Profile'}>
      <ProfileContainer className="space-y-7">
        <PageTitleDeprecated>Profile</PageTitleDeprecated>
        <section className="space-y-6">
          <div className="relative mt-1 flex h-40 w-full items-end justify-center rounded-t bg-gradient-to-r from-primary-900 to-plum-900">
            {(image || name || username || email) && (
              <Avatar
                src={image}
                size="xl"
                className="absolute translate-y-1/2"
                alt={`${name}'s avatar`}
                email={email}
                name={name}
                username={username}
              />
            )}
          </div>
          <div className="flex flex-row items-start justify-between pt-4">
            <div className="space-y-4">
              {isEditMode ? (
                <FormField
                  {...register('name', {
                    required: { value: true, message: 'Name is required' },
                  })}
                  label="Name"
                  errorMessage={errors.name}
                >
                  <Input />
                </FormField>
              ) : (
                name && <Heading as="h4">{name}</Heading>
              )}
              {username && (
                <Text title="Username, can't edit">@{username}</Text>
              )}
              {/* We only allow no email or unverified anonymous user to edit the email */}
              {isEditMode && (!email || (isAnonymous && !emailVerified)) ? (
                <FormField
                  {...register('email', {
                    pattern: {
                      value: EMAIL_RE,
                      message: `Invalid email address`,
                    },
                  })}
                  label="Email"
                  errorMessage={errors.email}
                  hint={
                    'You need to sign-in with this email address to verify it after saving'
                  }
                >
                  <Input />
                </FormField>
              ) : (
                email && (
                  <div>
                    <Text title="Email, can't edit it">{email}</Text>
                    {isAnonymous && !emailVerified && (
                      <Text variant="secondary" size="sm" className="mt-1.5">
                        This email address is unverified, you need to sign-in
                        with this email address to verify it
                      </Text>
                    )}
                  </div>
                )
              )}
            </div>
            <div className="flex flex-row space-x-2">
              {isEditMode && (
                <Popover>
                  <Popover.Button>
                    <IconTrash2 size={16} />
                    <span className="ml-1">Discard</span>
                  </Popover.Button>
                  <Popover.Panel>
                    <div className="flex flex-row items-center space-x-2">
                      <Text className="w-max">
                        Your unsaved content will lost, are you sure?
                      </Text>
                      <Button size="sm" onClick={handleClickDiscard}>
                        Confirm
                      </Button>
                    </div>
                  </Popover.Panel>
                </Popover>
              )}
              <Button
                className="space-x-1"
                onClick={handleClickButton}
                variant="primary"
                aria-label={`${isEditMode ? 'Save' : 'Edit'} profile`}
                disabled={!!process.env.NEXT_PUBLIC_MAINTENANCE_MODE}
              >
                {isEditMode ? <IconSave size={16} /> : <IconEdit2 size={16} />}
                <span>{isEditMode ? 'Save' : 'Edit'}</span>
              </Button>
            </div>
          </div>
          {isEditMode ? (
            <FormField {...register('bio')} label="Bio">
              <TextArea />
            </FormField>
          ) : (
            bio && <Text variant="secondary">{bio}</Text>
          )}
          {isEditMode ? (
            <FormField {...register('website')} label="Website">
              <Input prefix="https://" />
            </FormField>
          ) : (
            website && (
              <Link
                variant="primary"
                href={website}
                className="flex w-fit flex-row space-x-2"
              >
                <IconLink2 />
                <span>{website}</span>
              </Link>
            )
          )}
          {isEditMode ? (
            <FormField {...register('twitter')} label="Twitter">
              <Input prefix="https://twitter.com/" />
            </FormField>
          ) : (
            twitterUserName && (
              <Link
                variant="primary"
                href={`https://twitter.com/${twitterUserName}`}
                className="flex w-fit flex-row items-center space-x-2"
              >
                <IconTwitter size={22} />
                <span>@{twitterUserName}</span>
              </Link>
            )
          )}
        </section>
      </ProfileContainer>
    </AppLayout>
  );
}

function ProfileContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): JSX.Element {
  return <section className={className}>{children}</section>;
}
