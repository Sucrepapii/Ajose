import { createAdminClient } from "@/utils/supabase/admin";
import { 
  MessageSquare, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  User
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function AdminFeedbackPage() {
  const supabase = createAdminClient();
  
  // Fetch feedbacks with user details
  const { data: feedbacks } = await supabase
    .from("feedbacks")
    .select(`
      *,
      user:users (
        first_name,
        last_name,
        email
      )
    `)
    .order("created_at", { ascending: false });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'resolved':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </span>
        );
      case 'reviewed':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
            <AlertCircle className="w-3.5 h-3.5" /> Reviewed
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'bug': return 'text-red-600 bg-red-50 border-red-200';
      case 'feature': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'improvement': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#C5A059]" />
            User Feedback
          </h1>
          <p className="text-gray-500 mt-1">Review and manage feedback submitted by users.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search feedback..." 
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059] text-sm font-medium w-full md:w-64"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {(!feedbacks || feedbacks.length === 0) ? (
          <div className="p-12 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium">No feedback submitted yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 min-w-[300px]">Message</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {feedbacks.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {item.user?.first_name} {item.user?.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{item.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border capitalize ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700 line-clamp-2">{item.message}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs font-medium">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-100">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
