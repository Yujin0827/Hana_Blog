'use client';

import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useActionState, useReducer, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { type PostError, savePost, updatePost } from '@/lib/posts.action';

type Folder = {
  id: number;
  name: string;
};

const FOLDERS: Folder[] = [
  { id: 1, name: 'JavaScript' },
  { id: 2, name: 'TypeScript' },
  { id: 3, name: 'React' },
  { id: 4, name: 'Next.js' },
  { id: 5, name: 'etc.' },
];

export default function EditForm({ post }: { post?: any }) {
  const router = useRouter();
  const [isOpen, toggleOpen] = useReducer((p) => !p, false);

  const [folder, setFolder] = useState<Folder>(
    post ? FOLDERS.find((f) => f.id === post.folder)! : FOLDERS[0],
  );

  const [postError, action, isPending] = useActionState(
    async (_: PostError | undefined, formData: FormData) => {
      if (post) {
        const err = await updatePost(post.id, formData);
        if (err) return err;
      } else {
        const [err] = await savePost(formData);
        if (err) return err;
      }

      router.push('/blog'); // 저장 후 목록으로 이동
    },
    undefined,
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-center font-semibold text-2xl">
        {post ? '게시글 수정' : '게시글 작성'}
      </h1>

      <form action={action} className="space-y-4">
        {/* 카테고리 + 제목 */}
        <div className="flex gap-2">
          <DropdownMenu onOpenChange={toggleOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {folder.name}
                {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>카테고리 선택</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {FOLDERS.map((f) => (
                <DropdownMenuItem key={f.id} onClick={() => setFolder(f)}>
                  {f.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Input type="hidden" name="folder" value={folder.id} />

          <Input
            type="text"
            name="title"
            defaultValue={post?.title}
            placeholder="제목을 입력하세요"
          />
        </div>

        {/* 내용 */}
        <Textarea
          name="content"
          defaultValue={post?.content}
          placeholder="내용을 입력하세요"
          rows={8}
        />

        {!!postError && (
          <p className="text-red-500 text-sm">{postError.error}</p>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/blog')}
          >
            취소
          </Button>
          <Button type="submit" variant="apply" disabled={isPending}>
            {post ? '수정 저장' : '저장'}
            {isPending && '...'}
          </Button>
        </div>
      </form>
    </div>
  );
}
