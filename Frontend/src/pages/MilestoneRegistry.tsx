import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, AlertCircle, CreditCard, Search, X, Filter } from 'lucide-react';
import { api } from '../lib/api';

const fetchAllContracts = async () => (await api.get('/contracts/')).data;

export default function MilestoneRegistry() {
  const queryClient = useQueryClient();
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<any>(null);

  const [payData, setPayData] = useState({
    paid_date: new Date().toISOString().split('T')[0],
    transaction_reference_no: ''
  });

  // 1. Fetch all contracts to see their milestones
  const { data: contracts, isLoading } = useQuery({
    queryKey: ['contractsWithMilestones'],
    queryFn: fetchAllContracts
  });

  // 2. Fetch milestones for a specific selected contract
  const { data: milestones, isFetching: loadingMilestones } = useQuery({
    queryKey: ['milestones', selectedContractId],
    queryFn: async () => (await api.get(`/contracts/${selectedContractId}/milestones`)).data,
    enabled: !!selectedContractId
  });

  const payMutation = useMutation({
    mutationFn: async (payload: any) =>
      (await api.patch(`/contracts/${currentMilestone.milestone_id}/pay`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', selectedContractId] });
      setIsPayModalOpen(false);
      setPayData({ ...payData, transaction_reference_no: '' });
      alert("Payment successful. Milestone updated to PAID.");
    }
  });

  if (isLoading) return <div className="p-20 text-center animate-pulse text-cine-gold">Loading Ledger...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full">
      <div className="mb-10">
        <span className="font-mono text-xs tracking-widest text-cine-gold uppercase mb-2 block">Finance Manager</span>
        <h1 className="font-display text-4xl text-cine-ivory">Milestone Registry</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Contract List */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="font-caption text-xs text-cine-dust uppercase tracking-widest mb-4">Select Contract</h3>
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-2 space-y-2">
            {contracts?.map((c: any) => (
              <button
                key={c.contract_id}
                onClick={() => setSelectedContractId(c.contract_id)}
                className={`w-full text-left p-4 border transition-all ${selectedContractId === c.contract_id
                    ? 'bg-cine-gold/10 border-cine-gold'
                    : 'bg-cine-onyx border-cine-border hover:border-cine-dust'
                  }`}
              >
                <div className="font-display text-lg text-cine-ivory">{c.person_name}</div>
                <div className="font-mono text-[10px] text-cine-dust uppercase mt-1">{c.project_title} • {c.role}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Milestone Breakdown */}
        <div className="lg:col-span-8">
          {!selectedContractId ? (
            <div className="h-full flex flex-col items-center justify-center border border-dashed border-cine-border text-cine-dust font-mono text-xs uppercase">
              Select a contract to view payment schedule
            </div>
          ) : (
            <div className="bg-cine-onyx border border-cine-border">
              <div className="p-4 border-b border-cine-border bg-cine-void/50 flex justify-between items-center">
                <span className="font-caption text-xs text-cine-gold uppercase tracking-widest">Schedule for {contracts?.find((c: any) => c.contract_id === selectedContractId)?.person_name}</span>
              </div>

              <div className="p-6 space-y-6">
                {loadingMilestones ? <div className="text-cine-gold animate-pulse">Syncing...</div> : milestones?.map((m: any) => (
                  <div key={m.milestone_id} className="flex items-center justify-between border-b border-cine-border/30 pb-6 last:border-0">
                    <div className="flex gap-4">
                      <div className={`p-3 border ${m.payment_status === 'PAID' ? 'border-green-500/30 text-green-500' : 'border-cine-gold/30 text-cine-gold'}`}>
                        {m.payment_status === 'PAID' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-display text-xl text-cine-ivory">{m.milestone_name}</div>
                        <div className="font-mono text-xs text-cine-dust mt-1">Due Date: {m.due_date}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-display text-2xl text-cine-ivory mb-2">₹{(m.amount / 100000).toFixed(2)} L</div>
                      {m.payment_status === 'PAID' ? (
                        <div className="font-mono text-[10px] text-green-500 uppercase">Paid on {m.paid_date}</div>
                      ) : (
                        <button
                          onClick={() => { setCurrentMilestone(m); setIsPayModalOpen(true); }}
                          className="px-4 py-1.5 bg-cine-gold text-cine-void font-caption text-[10px] font-bold uppercase hover:bg-cine-gold-light"
                        >
                          Process Payment
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      <AnimatePresence>
        {isPayModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-cine-void/90 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-cine-onyx border border-cine-border p-8 w-full max-w-md">
              <h2 className="font-display text-2xl text-cine-ivory mb-2">Confirm Disbursement</h2>
              <p className="font-body text-sm text-cine-dust mb-6">Recording payment for <span className="text-cine-gold">{currentMilestone?.milestone_name}</span></p>

              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-[10px] text-cine-dust uppercase mb-2">Transfer Date</label>
                  <input type="date" value={payData.paid_date} onChange={(e) => setPayData({ ...payData, paid_date: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-cine-dust uppercase mb-2">Bank Ref / UTR Number *</label>
                  <input required type="text" value={payData.transaction_reference_no} onChange={(e) => setPayData({ ...payData, transaction_reference_no: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold" placeholder="NEFT-55621..." />
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setIsPayModalOpen(false)} className="flex-1 py-3 border border-cine-border text-cine-dust font-caption text-xs uppercase hover:bg-cine-border/20">Cancel</button>
                  <button
                    disabled={!payData.transaction_reference_no}
                    onClick={() => payMutation.mutate(payData)}
                    className="flex-1 py-3 bg-cine-gold text-cine-void font-caption text-xs font-bold uppercase hover:bg-cine-gold-light disabled:opacity-50"
                  >
                    Release Funds
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}