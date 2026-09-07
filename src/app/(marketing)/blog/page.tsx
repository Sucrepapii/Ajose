import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Àjọṣe",
  description: "Insights, news, and best practices on cooperative savings, personal finance, and the future of open banking.",
};

const POSTS = [
  {
    id: 1,
    title: "The Future of Cooperative Savings in Nigeria",
    excerpt: "How open banking and digital identities are transforming the traditional rotational savings group model from informal cash groups into secure, scalable financial instruments.",
    date: "Oct 12, 2026",
    category: "Industry",
    readTime: "5 min read",
    href: "#"
  },
  {
    id: 2,
    title: "How to Build Your Àjọṣe Credit Score",
    excerpt: "Your Àjọṣe Credit Score unlocks premium savings pools. Learn the top 3 strategies to maintain a perfect score and avoid the dreaded default penalty.",
    date: "Sep 28, 2026",
    category: "Guides",
    readTime: "4 min read",
    href: "#"
  },
  {
    id: 3,
    title: "Why We Chose Mono for Open Banking",
    excerpt: "A deep dive into our infrastructure decisions. We explore why Mono's direct debit mandate API is the perfect solution for automating Ajo contributions.",
    date: "Sep 15, 2026",
    category: "Engineering",
    readTime: "7 min read",
    href: "#"
  },
  {
    id: 4,
    title: "Protecting Your Savings: The Immutable Ledger",
    excerpt: "Trust but verify. How Àjọṣe uses immutable ledger technology to ensure no administrator or member can secretly alter the payout history.",
    date: "Aug 30, 2026",
    category: "Security",
    readTime: "6 min read",
    href: "#"
  }
];

export default function BlogPage() {
  return (
    <main className="flex-1 flex flex-col items-center relative overflow-hidden bg-[#FDFBF7] py-24 md:py-32">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0B3022]/5 rounded-full blur-[100px] -translate-y-1/2"></div>
      
      <div className="container mx-auto px-6 lg:px-12 max-w-6xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#0B3022] mb-6 font-serif">
            The Àjọṣe <span className="text-[#C5A059]">Journal</span>
          </h1>
          <p className="text-xl text-[#1F2937]/80 leading-relaxed max-w-2xl mx-auto font-medium">
            Insights on modernizing cooperative finance, building trust at scale, and achieving your financial goals.
          </p>
        </div>

        {/* Featured Post */}
        <div className="mb-16">
          <Link href={POSTS[0].href} className="group flex flex-col lg:flex-row bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden hover:shadow-2xl transition-all">
            <div className="lg:w-1/2 bg-[#0B3022] p-12 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#C5A059]/20 rounded-full blur-[50px]"></div>
              
              <div className="relative z-10">
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black bg-[#C5A059] text-[#0B3022] uppercase tracking-wider mb-6">
                  {POSTS[0].category}
                </span>
                <h2 className="text-3xl lg:text-4xl font-black text-white mb-4 leading-tight group-hover:text-[#C5A059] transition-colors">
                  {POSTS[0].title}
                </h2>
                <div className="flex items-center gap-4 text-white/60 text-sm font-medium">
                  <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {POSTS[0].date}</div>
                  <span>•</span>
                  <span>{POSTS[0].readTime}</span>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 p-10 lg:p-12 flex flex-col justify-center bg-white">
              <p className="text-[#1F2937]/80 text-lg leading-relaxed font-medium mb-8">
                {POSTS[0].excerpt}
              </p>
              <div className="flex items-center gap-2 text-[#0B3022] font-black group-hover:text-[#C5A059] transition-colors">
                Read Article <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* Post Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {POSTS.slice(1).map((post) => (
            <Link key={post.id} href={post.href} className="group bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all flex flex-col">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-gray-100 text-[#0B3022] uppercase tracking-wider mb-6 w-max">
                {post.category}
              </span>
              <h3 className="text-2xl font-black text-[#0B3022] mb-4 leading-snug group-hover:text-[#C5A059] transition-colors">
                {post.title}
              </h3>
              <p className="text-[#1F2937]/70 leading-relaxed font-medium mb-8 flex-1">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <div className="text-sm font-bold text-[#1F2937]/50">{post.date}</div>
                <div className="w-10 h-10 rounded-full bg-[#0B3022]/5 flex items-center justify-center group-hover:bg-[#0B3022] group-hover:text-white transition-colors">
                  <ArrowRight className="w-5 h-5 text-[#0B3022] group-hover:text-white transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}
