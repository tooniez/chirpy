import { RTEValue } from '@chirpy-dev/types';
import { COMMENT_TREE_MAX_DEPTH, isENVDev, cpDayjs } from '@chirpy-dev/utils';
import clsx from 'clsx';
import { AnimatePresence, m, Variants } from 'framer-motion';
import * as React from 'react';

import { Avatar } from '../../components/avatar';
import { ActionButton, Button } from '../../components/button';
import {
  IconMessageSquare,
  IconMoreVertical,
  IconTrash2,
} from '../../components/icons';
import { Menu, MenuItemPadding } from '../../components/menu';
import { Popover } from '../../components/popover';
import { Text } from '../../components/text';
import { useToast } from '../../components/toast';
import { useCommentContext } from '../../contexts/comment-context';
import { useCurrentUser } from '../../contexts/current-user-context';
import { CommentLeafType } from '../../types';
import { logger } from '../../utilities/logger';
import { Like, LikeAction } from '../like-action';
import { RichTextEditor } from '../rich-text-editor';
import { DeletedComment } from './deleted-comment';
import { TimelineLinkButton } from './timeline-link-button';

export type { ClickLikeActionHandler } from '../like-action';

export type Author = CommentLeafType['user'];

export type CommentCardProps = {
  commentId: string;
  author: Author;
  content: RTEValue;
  createdAt: Date;
  deletedAt?: Date | null;
  likes: Like[];
  depth: number;
  /**
   * Disable the timeline button, avoid navigate to the same page
   */
  disableTimelineButton?: boolean;
};

export function CommentCard({
  commentId,
  author,
  content,
  depth,
  createdAt,
  likes,
  disableTimelineButton,
  deletedAt,
}: CommentCardProps): JSX.Element {
  const { image, name, username, email } = author;
  const [showReplyEditor, setShowReplyEditor] = React.useState(false);
  const { projectId, deleteAComment, createAComment } = useCommentContext();
  const { showToast } = useToast();
  const handleClickConfirmDelete = () => {
    deleteAComment(commentId);
  };

  const handleSubmitReply = async (replyContent: RTEValue) => {
    try {
      await createAComment(replyContent, commentId);

      setShowReplyEditor(false);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Replied failed, try again later',
      });
      logger.error('Replied failed', error);
    }
  };
  const handleDimissRTE = () => {
    setShowReplyEditor(false);
  };
  const timelineURL = `/widget/comment/timeline/${commentId}`;
  const [containerAnimate, setContainerAnimate] = React.useState<
    'shake' | 'stop'
  >('stop');

  const handleClickLinkAction: React.MouseEventHandler<HTMLElement> = (e) => {
    if (disableTimelineButton) {
      e.preventDefault();
      setContainerAnimate('shake');
    }
  };
  const disabledReply: boolean = depth === COMMENT_TREE_MAX_DEPTH;
  const handlePressReply = React.useCallback(() => {
    if (disabledReply) {
      setContainerAnimate('shake');
      return;
    }
    setShowReplyEditor((prev) => !prev);
  }, [disabledReply]);
  const { data } = useCurrentUser();
  const isDeleted = !!deletedAt;
  const userHasModeratePermission =
    data?.editableProjectIds?.includes(projectId);

  if (isDeleted) {
    return <DeletedComment />;
  }
  const createdAtDate = cpDayjs(createdAt);
  return (
    <m.article
      animate={containerAnimate}
      variants={SHAKE_VARIANTS}
      onAnimationComplete={() => setContainerAnimate('stop')}
      className={clsx(
        `flex flex-row items-start space-x-3 rounded border border-gray-500 pt-4 pb-2 pl-4 shadow-xs`,
      )}
      id={isENVDev ? commentId : undefined}
    >
      <Avatar
        size="lg"
        src={image}
        alt={`${name}'s avatar`}
        email={email}
        name={name}
        username={username}
      />
      <div className="flex-1">
        <div className="flex flex-row items-start justify-between">
          <div className="flex flex-row items-start space-x-4">
            <Text bold className="!leading-none">
              {name}
            </Text>
            <Text
              variant="secondary"
              as="time"
              title={createdAtDate.format('YYYY-MM-DD HH:mm:ss')}
              className="cursor-default !leading-none"
              dateTime={createdAtDate.toISOString()}
            >
              {createdAtDate.fromNow()}
            </Text>
          </div>
          <>
            {userHasModeratePermission && (
              <Menu className="mr-3">
                <Menu.Button>
                  <IconMoreVertical size={20} />
                </Menu.Button>
                <Menu.Items>
                  <Menu.Item className="space-x-1" disableAutoDismiss>
                    <Popover>
                      <Popover.Panel placement="topEnd">
                        <div className="flex flex-row items-center space-x-2">
                          <Text size="sm" className="w-max">
                            Are you sure?
                          </Text>
                          <Button
                            size="sm"
                            color="red"
                            onClick={handleClickConfirmDelete}
                          >
                            Delete
                          </Button>
                        </div>
                      </Popover.Panel>
                      <Popover.Button as="button">
                        <div
                          className={clsx(
                            `flex flex-row items-center`,
                            MenuItemPadding,
                          )}
                        >
                          <IconTrash2 size={16} />
                          <span className="ml-1">Delete</span>
                        </div>
                      </Popover.Button>
                    </Popover>
                  </Menu.Item>
                </Menu.Items>
              </Menu>
            )}
          </>
        </div>
        <div className="mt-1 mb-1.5">
          <RichTextEditor initialValue={content} readOnly />
        </div>
        <div className="flex -translate-x-2 flex-row items-center space-x-6">
          <LikeAction
            aria-label="Like"
            likes={likes}
            commentId={commentId}
            title="Like this comment"
            disabled={!!process.env.NEXT_PUBLIC_MAINTENANCE_MODE}
          />
          <span onClick={handlePressReply} className="flex justify-center">
            <ActionButton
              aria-label="Reply"
              color="blue"
              disabled={
                disabledReply || !!process.env.NEXT_PUBLIC_MAINTENANCE_MODE
              }
              title={
                disabledReply
                  ? 'You have reached the maximum depth of replies'
                  : 'Reply to this comment'
              }
              icon={<IconMessageSquare size={20} className="-scale-x-1" />}
            />
          </span>
          <TimelineLinkButton
            disabled={disableTimelineButton}
            href={timelineURL}
            onClick={handleClickLinkAction}
          />
        </div>
        <AnimatePresence initial={false}>
          {showReplyEditor && (
            <m.div
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { opacity: 1, height: 'auto' },
                collapsed: { opacity: 0, height: 0 },
              }}
              transition={{ duration: 0.2 }}
              className="pr-6"
            >
              <RichTextEditor
                placeholder={`What are your thoughts? (Markdown supported)`}
                onSubmit={handleSubmitReply}
                styles={{ root: `mt-2` }}
                isReply
                onClickDismiss={handleDimissRTE}
              />
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </m.article>
  );
}

const SHAKE_VARIANTS: Variants = {
  shake: {
    translateX: [-20, 20, -10, 10, -5, 5, 0],
    transition: {
      duration: 0.35,
    },
  },
  stop: {
    translateX: 0,
  },
};
