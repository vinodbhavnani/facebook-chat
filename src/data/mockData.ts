import { Comment } from "@/types/comment.types";
import { User } from "@/types/user.types";
import { Attachment } from "@/types/attachment.types";

// --- Generate 300 users ---
const firstNames = [
  "James","Mary","Robert","Patricia","John","Jennifer","Michael","Linda","David","Elizabeth",
  "William","Barbara","Richard","Susan","Joseph","Jessica","Thomas","Sarah","Charles","Karen",
  "Christopher","Lisa","Daniel","Nancy","Matthew","Betty","Anthony","Margaret","Mark","Sandra",
  "Donald","Ashley","Steven","Kimberly","Paul","Emily","Andrew","Donna","Joshua","Michelle",
  "Kenneth","Carol","Kevin","Amanda","Brian","Dorothy","George","Melissa","Timothy","Deborah",
  "Ronald","Stephanie","Edward","Rebecca","Jason","Sharon","Jeffrey","Laura","Ryan","Cynthia",
  "Jacob","Kathleen","Gary","Amy","Nicholas","Angela","Eric","Shirley","Jonathan","Anna",
  "Stephen","Brenda","Larry","Pamela","Justin","Emma","Scott","Nicole","Brandon","Helen",
  "Benjamin","Samantha","Samuel","Katherine","Raymond","Christine","Gregory","Debra","Frank","Rachel",
  "Alexander","Carolyn","Patrick","Janet","Jack","Catherine","Dennis","Maria","Jerry","Heather",
  "Tyler","Diane","Aaron","Ruth","Jose","Julie","Adam","Olivia","Nathan","Joyce",
  "Henry","Virginia","Peter","Victoria","Zachary","Kelly","Douglas","Lauren","Harold","Christina",
  "Carl","Joan","Arthur","Evelyn","Gerald","Judith","Roger","Megan","Keith","Andrea",
  "Jeremy","Cheryl","Terry","Hannah","Lawrence","Jacqueline","Sean","Martha","Christian","Gloria",
  "Albert","Teresa","Joe","Ann","Ethan","Sara","Austin","Madison","Jesse","Frances",
];
const lastNames = [
  "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez",
  "Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin",
  "Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson",
  "Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores",
  "Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts",
  "Gomez","Phillips","Evans","Turner","Diaz","Parker","Cruz","Edwards","Collins","Reyes",
  "Stewart","Morris","Morales","Murphy","Cook","Rogers","Gutierrez","Ortiz","Morgan","Cooper",
  "Peterson","Bailey","Reed","Kelly","Howard","Ramos","Kim","Cox","Ward","Richardson",
  "Watson","Brooks","Chavez","Wood","James","Bennett","Gray","Mendoza","Ruiz","Hughes",
  "Price","Alvarez","Castillo","Sanders","Patel","Myers","Long","Ross","Foster","Jimenez",
];

function generateUsers(count: number): Record<string, User> {
  const users: Record<string, User> = {};
  for (let i = 0; i < count; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[i % lastNames.length];
    const suffix = i >= firstNames.length ? `${Math.floor(i / firstNames.length)}` : "";
    const id = `user_${i}`;
    const username = `${fn.toLowerCase()}_${ln.toLowerCase()}${suffix}`;
    users[id] = {
      id,
      username,
      displayName: `${fn} ${ln}${suffix ? ` ${suffix}` : ""}`,
      avatar: "",
      isOnline: Math.random() > 0.6,
      lastSeen: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
    };
  }
  return users;
}

// Seeded random for deterministic data
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const sampleContents = [
  "This is a great point! I totally agree with this perspective.",
  "Has anyone else experienced this issue? I've been stuck on it for hours.",
  "Just deployed the latest version. Everything looks good so far! 🚀",
  "I think we should consider a different approach here.",
  "**Great work** on this feature! The performance improvements are noticeable.",
  "Can someone review my PR? It's been open for a while now.",
  "The new design looks *amazing*! Really clean and intuitive.",
  "I found a bug in the login flow. Creating a ticket now.",
  "Does anyone have experience with this library? Looking for recommendations.",
  "Meeting notes from today's standup are posted in the shared doc.",
  "Love the progress on this project! Keep up the good work team 💪",
  "Quick question: what's the deadline for the next sprint?",
  "The API response times have improved by 40% after the optimization!",
  "Reminder: code freeze is tomorrow at 5 PM.",
  "Just finished the unit tests. Coverage is now at 85% ✅",
  "Who's available for a quick sync at 3 PM?",
  "The `useEffect` hook is causing an infinite loop. Need help debugging.",
  "Pushed a hotfix for the production issue. Please verify.",
  "The new onboarding flow reduced drop-off by 25%!",
  "Anyone going to the React conference next month?",
  "I refactored the auth module. Much cleaner now.",
  "The dark mode implementation is ready for review.",
  "Performance metrics from last week look promising.",
  "We should add error boundaries to prevent cascade failures.",
  "The migration script ran successfully on staging.",
  "Can we schedule a design review for the new dashboard?",
  "The accessibility audit flagged a few issues we need to address.",
  "Just merged the feature branch. CI is green ✅",
  "The load testing results show we can handle 10k concurrent users.",
  "Updated the README with the new setup instructions.",
  "The WebSocket connection keeps dropping. Investigating...",
  "Great feedback from the user testing session today!",
  "We need to update our dependencies. Some have security patches.",
  "The cache invalidation strategy needs rethinking.",
  "Deployed to staging. Ready for QA testing.",
  "The new color palette looks much more professional.",
  "Found a memory leak in the image gallery component.",
  "The search functionality is now ~3x faster with the new index.",
  "Can we add keyboard shortcuts for power users?",
  "The mobile layout needs some adjustments for smaller screens.",
  "Just set up the CI/CD pipeline for the new microservice.",
  "The A/B test results are in. Variant B wins by a clear margin.",
  "We should implement rate limiting on the API endpoints.",
  "The new caching layer reduced database queries by 60%.",
  "Anyone familiar with ~~Redux~~ Zustand state management?",
  "The TypeScript strict mode migration is almost complete.",
  "Need to add proper error handling in the payment flow.",
  "The new animation library is much lighter than the previous one.",
  "We should document these API changes before the release.",
  "The SSR implementation improved our Core Web Vitals significantly.",
];

const reactions = ["👍", "❤️", "😂", "😮", "😢", "🔥", "💯", "🎉", "🤔", "👏"];

function generateComments(userIds: string[], count: number): Record<string, Comment> {
  const rand = seededRandom(42);
  const comments: Record<string, Comment> = {};
  const rootIds: string[] = [];

  // Phase 1: Generate ~200 root comments
  const rootCount = Math.min(Math.floor(count * 0.4), 200);
  for (let i = 0; i < rootCount; i++) {
    const id = `comment_${i}`;
    const authorId = userIds[Math.floor(rand() * userIds.length)];
    const content = sampleContents[Math.floor(rand() * sampleContents.length)];

    // Random mentions
    const mentionCount = rand() > 0.7 ? Math.floor(rand() * 3) + 1 : 0;
    const mentions: string[] = [];
    for (let m = 0; m < mentionCount; m++) {
      const mentionedUser = userIds[Math.floor(rand() * userIds.length)];
      if (mentionedUser !== authorId && !mentions.includes(mentionedUser)) {
        mentions.push(mentionedUser);
      }
    }

    // Random reactions
    const reactionMap: Record<string, string[]> = {};
    const reactionCount = Math.floor(rand() * 4);
    for (let r = 0; r < reactionCount; r++) {
      const emoji = reactions[Math.floor(rand() * reactions.length)];
      const reactorCount = Math.floor(rand() * 5) + 1;
      const reactors: string[] = [];
      for (let rc = 0; rc < reactorCount; rc++) {
        const reactor = userIds[Math.floor(rand() * userIds.length)];
        if (!reactors.includes(reactor)) reactors.push(reactor);
      }
      reactionMap[emoji] = reactors;
    }

    const daysAgo = Math.floor(rand() * 30);
    const hoursAgo = Math.floor(rand() * 24);

    comments[id] = {
      id,
      parentId: null,
      authorId,
      content: mentions.length > 0
        ? `${content} ${mentions.map((mId) => `@user_${mId.split("_")[1]}`).join(" ")}`
        : content,
      timestamp: new Date(Date.now() - daysAgo * 86400000 - hoursAgo * 3600000).toISOString(),
      attachments: [],
      reactions: reactionMap,
      mentions,
      isEdited: rand() > 0.85,
      editedAt: rand() > 0.85 ? new Date(Date.now() - daysAgo * 86400000).toISOString() : null,
      replies: [],
    };
    rootIds.push(id);
  }

  // Phase 2: Generate replies (direct replies to root comments)
  let commentIndex = rootCount;
  const replyTargets = [...rootIds];

  const directReplyCount = Math.min(Math.floor(count * 0.35), 175);
  for (let i = 0; i < directReplyCount && commentIndex < count; i++) {
    const id = `comment_${commentIndex}`;
    const parentId = replyTargets[Math.floor(rand() * replyTargets.length)];
    const authorId = userIds[Math.floor(rand() * userIds.length)];
    const content = sampleContents[Math.floor(rand() * sampleContents.length)];

    const reactionMap: Record<string, string[]> = {};
    if (rand() > 0.5) {
      const emoji = reactions[Math.floor(rand() * reactions.length)];
      const reactors: string[] = [];
      const rc = Math.floor(rand() * 3) + 1;
      for (let j = 0; j < rc; j++) {
        const reactor = userIds[Math.floor(rand() * userIds.length)];
        if (!reactors.includes(reactor)) reactors.push(reactor);
      }
      reactionMap[emoji] = reactors;
    }

    const daysAgo = Math.floor(rand() * 28);
    comments[id] = {
      id,
      parentId,
      authorId,
      content,
      timestamp: new Date(Date.now() - daysAgo * 86400000 - Math.floor(rand() * 86400000)).toISOString(),
      attachments: [],
      reactions: reactionMap,
      mentions: [],
      isEdited: false,
      editedAt: null,
      replies: [],
    };
    comments[parentId].replies.push(id);
    replyTargets.push(id);
    commentIndex++;
  }

  // Phase 3: Generate sub-replies (replies to replies)
  const replyIds = Object.keys(comments).filter((id) => comments[id].parentId !== null);
  while (commentIndex < count) {
    const id = `comment_${commentIndex}`;
    const parentId = replyIds.length > 0
      ? replyIds[Math.floor(rand() * replyIds.length)]
      : rootIds[Math.floor(rand() * rootIds.length)];
    const authorId = userIds[Math.floor(rand() * userIds.length)];
    const content = sampleContents[Math.floor(rand() * sampleContents.length)];

    const reactionMap: Record<string, string[]> = {};
    if (rand() > 0.6) {
      const emoji = reactions[Math.floor(rand() * reactions.length)];
      reactionMap[emoji] = [userIds[Math.floor(rand() * userIds.length)]];
    }

    const daysAgo = Math.floor(rand() * 25);
    comments[id] = {
      id,
      parentId,
      authorId,
      content,
      timestamp: new Date(Date.now() - daysAgo * 86400000 - Math.floor(rand() * 86400000)).toISOString(),
      attachments: [],
      reactions: reactionMap,
      mentions: [],
      isEdited: false,
      editedAt: null,
      replies: [],
    };
    if (comments[parentId]) {
      comments[parentId].replies.push(id);
    }
    replyIds.push(id);
    commentIndex++;
  }

  return comments;
}

// Generate data
const generatedUsers = generateUsers(300);

// Add current user
generatedUsers["user_current"] = {
  id: "user_current",
  username: "you",
  displayName: "You",
  avatar: "",
  isOnline: true,
  lastSeen: new Date().toISOString(),
};

const userIds = Object.keys(generatedUsers);
const generatedComments = generateComments(userIds, 500);

export const mockUsers: Record<string, User> = generatedUsers;
export const mockComments: Record<string, Comment> = generatedComments;
export const mockAttachments: Record<string, Attachment> = {};

export const CURRENT_USER_ID = "user_current";
export const MAX_COMMENT_LENGTH = 500;
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
