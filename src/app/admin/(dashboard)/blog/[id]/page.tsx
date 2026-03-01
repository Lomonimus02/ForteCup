import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostForm from "../PostForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminBlogEditPage({ params }: Props) {
  const { id } = await params;

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <PostForm
      post={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        imageUrl: post.imageUrl ?? "",
        isPublished: !!post.publishedAt,
      }}
    />
  );
}
