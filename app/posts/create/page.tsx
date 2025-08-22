import { Suspense } from "react";

// 같은 폴더에 있는 두 컴포넌트를 모두 import 합니다.
import CreatePost from "./CreatePost";
import CreatePostClientView from "./create-post-client";

const Loading = () => <p>Loading create form...</p>;

export default function CreatePostPage() {
  return (
    <div>
      <h1>Create a New Post</h1>
      {/* 두 컴포넌트 모두 useSearchParams를 사용하므로
        하나의 Suspense 블록 안에 함께 넣어줄 수 있습니다.
      */}
      <Suspense fallback={<Loading />}>
        <CreatePost />
        <hr /> {/* 컴포넌트 구분을 위한 선 */}
        <CreatePostClientView />
      </Suspense>
    </div>
  );
}