import { Suspense } from "react";

// 같은 폴더에 있는 CreatePost 컴포넌트를 import 합니다.
// (만약 사용하는 파일이 create-post-client.tsx 라면 그에 맞게 수정)
import CreatePost from "./CreatePost";

const Loading = () => <p>게시글 작성 양식을 불러오는 중...</p>;

export default function CreatePostPage() {
  return (
    <div>
      <h1>새 게시글 작성</h1>
      
      {/* CreatePost 컴포넌트가 useSearchParams를 사용하므로
        이 페이지에서도 반드시 Suspense로 감싸줍니다.
      */}
      <Suspense fallback={<Loading />}>
        <CreatePost />
      </Suspense>
    </div>
  );
}

//^모^