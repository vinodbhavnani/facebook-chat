import { Comment as CommentType } from "@/types/comment.types";
import CommentComponent from "./Comment";

interface CommentListProps {
  comments: CommentType[];
}

/** Renders a list of comments */
const CommentList = ({ comments }: CommentListProps) => {
  if (comments.length === 0) return null;

  return (
    <div role="list" aria-label="Comment list">
      {comments.map((comment) => (
        <CommentComponent key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

export default CommentList;
