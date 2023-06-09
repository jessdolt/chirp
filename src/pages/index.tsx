import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import { useState } from "react";
import { type RouterOutputs } from "~/utils/api";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();
  const [input, setInput] = useState<string>("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
  });

  if (!user) return null;

  return (
    <div className="flex w-full gap-3">
      <Image
        width={56}
        height={56}
        src={user.profileImageUrl}
        alt="Profile Image"
        className="h-14 w-14 rounded-full"
      />
      <input
        placeholder="Type Something"
        className="w-full flex-1 bg-transparent text-slate-400 outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isPosting}
      />
      <button onClick={() => mutate({ content: input })}>Post</button>
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="flex  gap-3 border-b border-slate-400 p-4">
      <Image
        width={56}
        height={56}
        src={author.profileImageUrl}
        alt="Profile Image"
        className="h-14 w-14 rounded-full"
        priority
      />
      <div className="flex flex-col justify-between">
        <div className="flex items-center gap-2 ">
          <span className="text-slate-300">@{author.username}</span>·
          <span className="text-md text-sm font-thin text-slate-400">
            {dayjs(post.createdAt).fromNow()}
          </span>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading } = api.posts.getAll.useQuery();

  if (isLoading) return <LoadingPage />;

  if (!data) return <div>No Data Found</div>;

  return (
    <div className="flex flex-col">
      {data?.map(({ post, author }) => (
        <PostView post={post} author={author} key={post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
          <div className="flex border-b border-slate-400 p-4">
            <div className="r flex w-full">
              <SignedIn>
                <CreatePostWizard />
              </SignedIn>
              <SignedOut>
                <SignInButton />
              </SignedOut>
            </div>
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;
