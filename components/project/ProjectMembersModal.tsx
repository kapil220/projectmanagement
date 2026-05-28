import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { XMarkIcon, UserPlusIcon, TrashIcon, UserGroupIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface TeamMember {
  id: string;
  userId: string;
  role: string;
  user: { id: string; name: string; email: string; image?: string };
}

interface ProjectMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
}

interface ProjectMembersModalProps {
  projectId: string;
  projectName: string;
  teamSlug: string;
  visible: boolean;
  onClose: () => void;
}

type Tab = 'existing' | 'invite';

const ProjectMembersModal = ({ projectId, projectName, teamSlug, visible, onClose }: ProjectMembersModalProps) => {
  const [activeTab, setActiveTab] = useState<Tab>('existing');
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchProjectMembers();
      fetchTeamMembers();
    }
  }, [visible, projectId]);

  const fetchProjectMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}/members`);
      const data = await res.json();
      if (res.ok) setProjectMembers(data.data || []);
    } catch { toast.error('Failed to load project members'); }
    finally { setLoading(false); }
  };

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch(`/api/teams/${teamSlug}/members`);
      const data = await res.json();
      if (res.ok) setTeamMembers(data.data || []);
    } catch { toast.error('Failed to load team members'); }
  };

  // Add an existing team member to the project
  const addExistingMember = async () => {
    if (!selectedUserId) return;
    const member = teamMembers.find((m) => m.userId === selectedUserId);
    if (!member) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: member.userId,
          userName: member.user.name,
          userEmail: member.user.email,
          role: 'MEMBER',
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error?.message || 'Failed to add member'); return; }
      setProjectMembers((prev) => [...prev, data.data]);
      setSelectedUserId('');
      toast.success(`${member.user.name} added to project`);
    } catch { toast.error('Failed to add member'); }
    finally { setAdding(false); }
  };

  // Invite a new person by email as a GUEST
  const sendGuestInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const res = await fetch(`/api/teams/${teamSlug}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: 'GUEST',
          sentViaEmail: true,
          projectId,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error?.message || 'Failed to send invite'); return; }
      setInviteEmail('');
      toast.success(`Invite sent to ${inviteEmail} — they will only have access to this project`);
    } catch { toast.error('Failed to send invite'); }
    finally { setInviting(false); }
  };

  const removeMember = async (memberId: string, userName: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/members?memberId=${memberId}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Failed to remove member'); return; }
      setProjectMembers((prev) => prev.filter((m) => m.id !== memberId));
      toast.success(`${userName} removed from project`);
    } catch { toast.error('Failed to remove member'); }
  };

  const availableMembers = teamMembers.filter(
    (tm) => !projectMembers.some((pm) => pm.userId === tm.userId)
  );

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg mx-4 rounded-2xl border border-white/10 bg-[#0f1117] shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-violet-900/30 to-indigo-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/20 border border-violet-500/30">
              <UserGroupIcon className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-base">Project Members</h2>
              <p className="text-xs text-gray-400 mt-0.5">{projectName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('existing')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'existing' ? 'text-violet-400 border-b-2 border-violet-500 bg-violet-500/5' : 'text-gray-400 hover:text-white'}`}
          >
            From Team
          </button>
          <button
            onClick={() => setActiveTab('invite')}
            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'invite' ? 'text-violet-400 border-b-2 border-violet-500 bg-violet-500/5' : 'text-gray-400 hover:text-white'}`}
          >
            <EnvelopeIcon className="w-4 h-4" />
            Invite as Guest
          </button>
        </div>

        {/* Tab Content */}
        <div className="px-6 py-4 border-b border-white/10">
          {activeTab === 'existing' ? (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Add existing team member</label>
              <div className="flex gap-2">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                >
                  <option value="">Select a team member...</option>
                  {availableMembers.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.user.name} — {m.user.email}
                    </option>
                  ))}
                </select>
                <button
                  onClick={addExistingMember}
                  disabled={!selectedUserId || adding}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-all"
                >
                  <UserPlusIcon className="w-4 h-4" />
                  {adding ? 'Adding...' : 'Add'}
                </button>
              </div>
              {availableMembers.length === 0 && !loading && (
                <p className="text-xs text-gray-500 mt-2">All team members are already in this project.</p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Invite by email</label>
              <p className="text-xs text-gray-500 mb-3">They will join as a <span className="text-violet-400 font-medium">Guest</span> — only access to this project, not the whole organization.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  onKeyDown={(e) => e.key === 'Enter' && sendGuestInvite()}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
                <button
                  onClick={sendGuestInvite}
                  disabled={!inviteEmail.trim() || inviting}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-all whitespace-nowrap"
                >
                  <EnvelopeIcon className="w-4 h-4" />
                  {inviting ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Member List */}
        <div className="px-6 py-4 max-h-64 overflow-y-auto">
          <label className="block text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">
            Current Members ({projectMembers.length})
          </label>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : projectMembers.length === 0 ? (
            <div className="text-center py-6">
              <UserGroupIcon className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No members yet. Add one above.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {projectMembers.map((member) => (
                <li key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {member.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{member.userName}</p>
                      <p className="text-xs text-gray-400">{member.userEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${member.role === 'GUEST' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-violet-500/20 text-violet-300 border-violet-500/30'}`}>
                      {member.role}
                    </span>
                    <button
                      onClick={() => removeMember(member.id, member.userName)}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                      title="Remove from project"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer note */}
        <div className="px-6 py-3 border-t border-white/5 bg-white/[0.02]">
          <p className="text-xs text-gray-500">
            <span className="text-violet-400">Guests</span> can only see this project. <span className="text-blue-400">Members</span> have full org access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectMembersModal;
