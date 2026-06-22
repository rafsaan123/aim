export const site = {
  name: "AIM Engineering Job Coaching",
  tagline: "ভবিষ্যৎ গড়তে শেখুন",
  email: "mehedirubel@aimsurveyjob.com",
  phone: "+880 1XXX-XXXXXX",
  address: "ঢাকা, বাংলাদেশ",
  loginPath: "/login",
} as const;

export const navLinks = [
  { href: "/", label: "হোম" },
  { href: "/courses", label: "কোর্স" },
  { href: "/books", label: "বই" },
  { href: "/success-story", label: "সাফল্যের গল্প" },
  { href: "/contact", label: "যোগাযোগ" },
] as const;

export const homeHighlights = [
  {
    title: "অভিজ্ঞ মেন্টর",
    description: "ইঞ্জিনিয়ারিং চাকরির প্রস্তুতিতে বাস্তব অভিজ্ঞতা ও গাইডলাইন।",
    icon: "🎓",
  },
  {
    title: "লাইভ ও রেকর্ডেড ক্লাস",
    description: "যেকোনো সময়, যেকোনো জায়গা থেকে পড়াশোনা করুন।",
    icon: "📱",
  },
  {
    title: "মক টেস্ট ও ম্যাটেরিয়াল",
    description: "অনলাইন পরীক্ষা, PDF নোট ও হাতে লেখা উত্তর যাচাই।",
    icon: "📝",
  },
  {
    title: "ফলাফল ট্র্যাকিং",
    description: "নিজের অগ্রগতি দেখুন ও দুর্বলতা ঠিক করুন।",
    icon: "📊",
  },
] as const;

export const stats = [
  { value: "৫০০+", label: "শিক্ষার্থী" },
  { value: "২০+", label: "কোর্স ও ব্যাচ" },
  { value: "৯৫%", label: "সন্তুষ্টি" },
  { value: "২৪/৭", label: "অনলাইন সাপোর্ট" },
] as const;

export const courses = [
  {
    title: "BCS ইঞ্জিনিয়ারিং প্রস্তুতি",
    description:
      "BCS ইঞ্জিনিয়ারিং ক্যাডারের জন্য সম্পূর্ণ সিলেবাস, MCQ ও written প্রস্তুতি।",
    duration: "৬ মাস",
    level: "ইন্টারমিডিয়েট",
    accent: "from-blue-600 to-indigo-700",
  },
  {
    title: "ব্যাংক জব (ইঞ্জিনিয়ার)",
    description:
      "ব্যাংক ও আর্থিক প্রতিষ্ঠানের ইঞ্জিনিয়ার পদের লিখিত ও viva প্রস্তুতি।",
    duration: "৪ মাস",
    level: "বেসিক–অ্যাডভান্স",
    accent: "from-orange-500 to-amber-600",
  },
  {
    title: "সরকারি চাকরি MCQ",
    description:
      "গণপূর্ত, রেল, বিদ্যুৎ ও অন্যান্য সরকারি ইঞ্জিনিয়ারিং পদের MCQ মাস্টারি।",
    duration: "৩ মাস",
    level: "অল লেভেল",
    accent: "from-emerald-600 to-teal-700",
  },
  {
    title: "টেকনিক্যাল ইন্টারভিউ",
    description:
      "ইঞ্জিনিয়ারিং ইন্টারভিউ, GD ও presentation এর জন্য ব্যবহারিক প্রস্তুতি।",
    duration: "২ মাস",
    level: "ফাইনাল ইয়ার",
    accent: "from-violet-600 to-purple-700",
  },
] as const;

export const books = [
  {
    title: "ইঞ্জিনিয়ারিং জব প্রিপ গাইড",
    author: "AIM Faculty",
    type: "PDF + প্রিন্ট",
    description: "চাকরির পুরো প্রস্তুতির রোডম্যাপ, টিপস ও সিলেবাস বিশ্লেষণ।",
  },
  {
    title: "MCQ ব্যাংক — মেকানিক্যাল",
    author: "AIM Team",
    type: "ডিজিটাল",
    description: "বিগত বছরের প্রশ্ন ও মডেল টেস্টসহ ৫০০০+ MCQ।",
  },
  {
    title: "Written Exam নমুনা উত্তর",
    author: "AIM Faculty",
    type: "PDF",
    description: "লিখিত পরীক্ষার জন্য সাজানো নমুনা উত্তর ও কাঠামো।",
  },
  {
    title: "Viva & Interview Handbook",
    author: "AIM Team",
    type: "PDF + অডিও",
    description: "সাধারণ ও টেকনিক্যাল প্রশ্নের উত্তর ও প্র্যাকটিস গাইড।",
  },
] as const;

export const successStories = [
  {
    name: "রাফি হাসান",
    role: "BCS ইঞ্জিনিয়ারিং — নির্বাচিত",
    quote:
      "AIM-এর মক টেস্ট ও written ফিডব্যাক ছাড়া BCS-এ সফল হওয়া সম্ভব হতো না। মেন্টররা প্রতিটি দুর্বলতা ধরে সাহায্য করেছেন।",
    batch: "২০২৪ ব্যাচ",
  },
  {
    name: "সুমাইয়া আক্তার",
    role: "ব্যাংক — Assistant Engineer",
    quote:
      "অনলাইন ক্লাস ও PDF ম্যাটেরিয়াল খুবই সুবিন্যস্ত। চাকরির চাপের মাঝেও নিজের গতিতে পড়তে পেরেছি।",
    batch: "২০২৫ ব্যাচ",
  },
  {
    name: "তানভীর আহমেদ",
    role: "গণপূর্ত — Sub Assistant Engineer",
    quote:
      "MCQ প্র্যাকটিস আর written উত্তর যাচাই সিস্টেম আমাকে নিয়মিত প্রস্তুতি নিতে অনুপ্রাণিত করেছে।",
    batch: "২০২৪ ব্যাচ",
  },
  {
    name: "নুসরাত জাহান",
    role: "রেল — JE (Junior Engineer)",
    quote:
      "AIM শুধু কোচিং নয়, একটা সম্পূর্ণ সাপোর্ট সিস্টেম। প্রশ্ন করলেই দ্রুত উত্তর পাই।",
    batch: "২০২৫ ব্যাচ",
  },
] as const;
