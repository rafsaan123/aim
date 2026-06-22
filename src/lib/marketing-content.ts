export const site = {
  name: "AIM Engineering Job Coaching",
  tagline: "সার্ভে ইঞ্জিনিয়ারিং — ভবিষ্যৎ গড়তে শেখুন",
  email: "mehedirubel@aimsurveyjob.com",
  orderPhone: "+8801786041504",
  orderPhoneDisplay: "01786-041504",
  phone: "+8801786041504",
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
    title: "সার্ভে ইঞ্জিনিয়ারিং ফোকাস",
    description: "BCS, সরকারি ও প্রাইভেট সার্ভে পদের জন্য বিশেষায়িত প্রস্তুতি।",
    icon: "📐",
  },
  {
    title: "অভিজ্ঞ মেন্টর",
    description: "মাঠ পর্যায়ের অভিজ্ঞতা ও written, MCQ, viva গাইডলাইন।",
    icon: "🎓",
  },
  {
    title: "অনলাইন ক্লাস ও নোট",
    description: "লাইভ/রেকর্ডেড ক্লাস, PDF ম্যাটেরিয়াল ও মক টেস্ট।",
    icon: "📱",
  },
  {
    title: "ফলাফল ট্র্যাকিং",
    description: "অনলাইন পরীক্ষা, written যাচাই ও গ্রেডেড ফলাফল।",
    icon: "📊",
  },
] as const;

export const stats = [
  { value: "৫০০+", label: "শিক্ষার্থী" },
  { value: "২০+", label: "কোর্স ও ব্যাচ" },
  { value: "৯৫%", label: "সন্তুষ্টি" },
  { value: "২৪/৭", label: "অনলাইন সাপোর্ট" },
] as const;
