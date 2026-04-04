import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, Plus, Search, Filter, X, Landmark, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';

// -- API Fetchers --
const fetchProjects = async () => (await api.get('/projects/')).data;
const fetchVendors = async () => (await api.get('/vendors/')).data; // Assuming vendor endpoint exists

export default function ExpenseLedger() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');

    const [formData, setFormData] = useState({
        project_id: '',
        budget_head_id: '',
        vendor_id: '',
        description: '',
        amount: '',
        expense_date: '',
        payment_mode: 'NEFT',
        invoice_no: ''
    });

    // Queries
    const { data: projects } = useQuery({ queryKey: ['projectsAll'], queryFn: fetchProjects });
    const { data: budgetHeads } = useQuery({
        queryKey: ['budgetHeads', selectedProjectId],
        queryFn: async () => (await api.get(`/projects/${selectedProjectId}/budget`)).data,
        enabled: !!selectedProjectId
    });

    const recordExpenseMutation = useMutation({
        mutationFn: async (payload: any) => (await api.post('/expenses/', payload)).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projectsAll'] });
            setIsModalOpen(false);
            alert("Expense logged! Status is PENDING until approved.");
        },
        onError: (error: any) => alert(`Logging failed: ${error.response?.data?.detail}`)
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        recordExpenseMutation.mutate({
            ...formData,
            project_id: Number(formData.project_id),
            budget_head_id: Number(formData.budget_head_id),
            vendor_id: Number(formData.vendor_id),
            amount: Number(formData.amount)
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 w-full">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <span className="font-mono text-xs tracking-widest text-cine-gold uppercase mb-2 block">Finance Manager</span>
                    <h1 className="font-display text-4xl text-cine-ivory">Expense Ledger</h1>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-cine-gold text-cine-void px-6 py-2.5 font-caption text-xs font-bold uppercase hover:bg-cine-gold-light transition-colors"
                >
                    <Plus className="w-4 h-4" /> Log Invoice
                </button>
            </div>

            {/* -- PROJECT CARDS WITH OVERSPENT FLAGS -- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects?.map((project: any) => (
                    <div key={project.project_id} className="bg-cine-onyx border border-cine-border p-6 group">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-display text-xl text-cine-ivory">{project.title}</h3>
                            {project.overspent_flag && (
                                <div title="Budget Overrun Detected">
                                    <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                                </div>
                            )}
                        </div>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between font-mono text-[10px] text-cine-dust">
                                <span>Sanctioned</span>
                                <span className="text-cine-ivory">₹{(project.total_budget / 10000000).toFixed(2)} Cr</span>
                            </div>
                            <div className="flex justify-between font-mono text-[10px] text-cine-dust">
                                <span>Invoices Logged</span>
                                <span className="text-cine-gold">{project.expenses}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => { setSelectedProjectId(project.project_id); setIsModalOpen(true); setFormData({ ...formData, project_id: project.project_id }); }}
                            className="w-full py-2 bg-cine-void border border-cine-border text-cine-dust font-caption text-[10px] uppercase tracking-widest hover:border-cine-gold hover:text-cine-gold transition-all"
                        >
                            Add Project Expense
                        </button>
                    </div>
                ))}
            </div>

            {/* -- LOG MODAL -- */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-cine-void/80 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-cine-onyx border border-cine-border p-8 w-full max-w-2xl relative shadow-2xl">
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-cine-dust hover:text-cine-ivory"><X className="w-5 h-5" /></button>
                            <h2 className="font-display text-3xl text-cine-ivory mb-6 italic">Record Vendor Expense</h2>

                            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block font-mono text-[10px] text-cine-dust uppercase mb-2">Project *</label>
                                    <select required value={formData.project_id} onChange={(e) => { setFormData({ ...formData, project_id: e.target.value }); setSelectedProjectId(e.target.value); }} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold">
                                        <option value="">-- Select Project --</option>
                                        {projects?.map((p: any) => <option key={p.project_id} value={p.project_id}>{p.title}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-mono text-[10px] text-cine-dust uppercase mb-2">Budget Head *</label>
                                    <select required value={formData.budget_head_id} onChange={(e) => setFormData({ ...formData, budget_head_id: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold">
                                        <option value="">-- Select Department --</option>
                                        {budgetHeads?.map((bh: any) => <option key={bh.budget_head_id} value={bh.budget_head_id}>{bh.category_name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-mono text-[10px] text-cine-dust uppercase mb-2">Vendor ID *</label>
                                    <input required type="number" value={formData.vendor_id} onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold" placeholder="e.g. 1" />
                                </div>

                                <div className="col-span-2">
                                    <label className="block font-mono text-[10px] text-cine-dust uppercase mb-2">Invoice Description *</label>
                                    <input required type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold" placeholder="VFX Progress Payment - Sc 12-15" />
                                </div>

                                <div>
                                    <label className="block font-mono text-[10px] text-cine-dust uppercase mb-2">Amount (₹) *</label>
                                    <input required type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold" />
                                </div>

                                <div>
                                    <label className="block font-mono text-[10px] text-cine-dust uppercase mb-2">Expense Date *</label>
                                    <input required type="date" value={formData.expense_date} onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold [color-scheme:dark]" />
                                </div>

                                <button type="submit" disabled={recordExpenseMutation.isPending} className="col-span-2 mt-4 bg-cine-gold text-cine-void py-3 font-caption text-xs font-bold uppercase hover:bg-cine-gold-light transition-colors">
                                    {recordExpenseMutation.isPending ? 'Logging Invoice...' : 'Commit to Ledger'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}