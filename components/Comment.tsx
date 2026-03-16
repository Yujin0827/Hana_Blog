'use client';

import { useState, useTransition } from 'react';
import {
  addComment,
  addReply,
  deleteComment,
  updateComment,
} from '@/lib/blog.action';

type CommentUser = { name: string };

type Reply = {
  id: number;
  content: string | null;
  isdeleted: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  User: CommentUser;
};

type Comment = {
  id: number;
  content: string | null;
  isdeleted: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  User: CommentUser;
  other_Comment: Reply[];
};

export default function Comment({
  postId,
  comments,
  path,
  isLoggedIn,
}: {
  postId: number;
  comments: Comment[];
  path: string;
  isLoggedIn: boolean;
}) {
  const [text, setText] = useState('');
  const [pending, startTransition] = useTransition();

  return (
    <section className="mt-10 space-y-4">
      <h2 className="font-semibold">댓글</h2>

      {/* 댓글 작성 - 로그인 시에만 가능 */}
      {isLoggedIn && (
        <div className="rounded border p-3">
          <textarea
            className="w-full resize-none rounded border bg-background p-2 text-sm"
            rows={3}
            placeholder="댓글을 입력하세요"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={pending}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              className="rounded bg-primary px-3 py-2 text-primary-foreground text-sm disabled:opacity-60"
              disabled={pending || !text.trim()}
              onClick={() =>
                startTransition(async () => {
                  await addComment(postId, text, path);
                  setText('');
                })
              }
            >
              등록
            </button>
          </div>
        </div>
      )}

      {/* 댓글 목록 */}
      {comments.map((c) => (
        <CommentItem
          key={c.id}
          c={c}
          postId={postId}
          path={path}
          isLoggedIn={isLoggedIn}
        />
      ))}
    </section>
  );
}

// 댓글
function CommentItem({
  c,
  postId,
  path,
  isLoggedIn,
}: {
  c: Comment;
  postId: number;
  path: string;
  isLoggedIn: boolean;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(c.content ?? '');
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded border p-3">
      {/* 삭제된 댓글 */}
      {c.isdeleted ? (
        <span className="text-muted-foreground text-sm">삭제된 댓글입니다</span>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="font-semibold text-sm">{c.User.name}</div>

            {/* 로그인 시에만 */}
            {isLoggedIn && (
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-muted-foreground text-xs hover:underline"
                  onClick={() => setReplyOpen((v) => !v)}
                >
                  답글
                </button>

                <button
                  type="button"
                  className="text-muted-foreground text-xs hover:underline"
                  onClick={() => setIsEditing((v) => !v)}
                >
                  수정
                </button>

                <button
                  type="button"
                  className="text-muted-foreground text-xs hover:underline"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await deleteComment(c.id, path);
                    })
                  }
                >
                  삭제
                </button>
              </div>
            )}
          </div>

          {/* 수정 */}
          {isEditing ? (
            <ReplyForm
              initialValue={text}
              isLoggedIn={isLoggedIn}
              onCancel={() => setIsEditing(false)}
              onSubmit={(newText) =>
                startTransition(async () => {
                  await updateComment(c.id, newText, path);
                  setIsEditing(false);
                })
              }
            />
          ) : (
            <>
              <p className="mt-2 text-sm">{c.content}</p>

              <div className="mt-2 text-muted-foreground text-xs">
                작성: {new Date(c.createdAt).toLocaleString()}
                {c.updatedAt &&
                  new Date(c.updatedAt).getTime() !==
                    new Date(c.createdAt).getTime() && (
                    <>
                      {' • '}
                      수정: {new Date(c.updatedAt).toLocaleString()}
                      <span className="ml-1 text-gray-400">(수정됨)</span>
                    </>
                  )}
              </div>
            </>
          )}
        </>
      )}

      {/* 대댓글 목록 */}
      {c.other_Comment.length > 0 && (
        <div className="mt-3 space-y-2">
          {c.other_Comment.map((r) => (
            <ReplyItem
              key={r.id}
              r={r}
              postId={postId}
              parentId={c.id}
              path={path}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>
      )}

      {/* 대댓글 Form */}
      {replyOpen && isLoggedIn && (
        <ReplyForm
          isLoggedIn={isLoggedIn}
          onCancel={() => setReplyOpen(false)}
          onSubmit={(text) =>
            startTransition(async () => {
              await addReply(postId, c.id, text, path);
              setReplyOpen(false);
            })
          }
        />
      )}
    </div>
  );
}

// 대댓글
function ReplyItem({
  r,
  postId,
  parentId,
  path,
  isLoggedIn,
}: {
  r: Reply;
  postId: number;
  parentId: number;
  path: string;
  isLoggedIn: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [text, setText] = useState(r.content ?? '');

  return (
    <div className="ml-4 rounded border p-2 text-sm">
      {r.isdeleted ? (
        <span className="text-muted-foreground">삭제된 댓글입니다</span>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="font-semibold text-xs">{r.User.name}</div>

            {isLoggedIn && (
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-muted-foreground text-xs hover:underline"
                  onClick={() => setIsEditing((v) => !v)}
                >
                  수정
                </button>

                <button
                  type="button"
                  className="text-muted-foreground text-xs hover:underline"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await deleteComment(r.id, path);
                    })
                  }
                >
                  삭제
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <ReplyForm
              initialValue={text}
              isLoggedIn={isLoggedIn}
              onCancel={() => setIsEditing(false)}
              onSubmit={(newText) =>
                startTransition(async () => {
                  await updateComment(r.id, newText, path);
                  setIsEditing(false);
                })
              }
            />
          ) : (
            <>
              <div className="mt-1">{r.content}</div>

              <div className="mt-1 text-muted-foreground text-xs">
                작성: {new Date(r.createdAt).toLocaleString()}
                {r.updatedAt &&
                  new Date(r.updatedAt).getTime() !==
                    new Date(r.createdAt).getTime() && (
                    <>
                      {' • '}
                      수정: {new Date(r.updatedAt).toLocaleString()}
                      <span className="ml-1 text-gray-400">(수정됨)</span>
                    </>
                  )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

// 답글 및 수정 Form
function ReplyForm({
  isLoggedIn,
  initialValue = '',
  onCancel,
  onSubmit,
}: {
  isLoggedIn: boolean;
  initialValue?: string;
  onCancel: () => void;
  onSubmit: (text: string) => void;
}) {
  const [text, setText] = useState(initialValue);
  const [pending] = useTransition();

  if (!isLoggedIn) return null;

  return (
    <div className="mt-2 ml-4 rounded bg-muted/30 p-2">
      <textarea
        className="w-full resize-none rounded border bg-background p-2 text-sm"
        rows={2}
        placeholder="내용을 입력하세요"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={pending}
      />
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          className="rounded border px-3 py-1 text-sm"
          onClick={onCancel}
        >
          취소
        </button>
        <button
          type="button"
          className="rounded bg-primary px-3 py-1 text-primary-foreground text-sm disabled:opacity-60"
          disabled={pending || !text.trim()}
          onClick={() => onSubmit(text)}
        >
          저장
        </button>
      </div>
    </div>
  );
}
