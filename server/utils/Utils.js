import { format } from "timeago.js";
import { normalizeId } from "./idUtils.js";

export const mapPostOutput = (post, userId) => {
  if (!post) return null;

  const owner = post.owner && post.owner._id ? post.owner : { _id: post.owner };

  const likesArr = (post.likes || []).map((l) => normalizeId(l));
  const curId = normalizeId(userId);

  return {
    _id: normalizeId(post._id),
    caption: post.caption,
    image: post.image,
    owner: {
      _id: owner._id ? normalizeId(owner._id) : null,
      name: owner.name ?? null,
      avatar: owner.avatar ?? null,
    },
    likesCount: post.likes ? post.likes.length : 0,
    isLiked: likesArr.includes(curId),
    timeAgo: format(post.createdAt),
  };
};
