'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  RefreshCw, 
  Download, 
  Eye, 
  RotateCcw,
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import AdminPageWrapper from '@/components/AdminPageWrapper';
import { useLanguage } from '@/lib/language';
import { 
  LineChart as MuiLineChart, 
  BarChart as MuiBarChart, 
  PieChart as MuiPieChart 
} from '@mui/x-charts';

interface Payment {
  payment_id: string;
  payment_date: string;
  payment_status: 'NEW' | 'FAILED' | 'PAID' | 'REFUNDED';
  payment_fee: number;
  payment_amount: number;
  payment_currency: string;
  payment_wallet: string;
  payment_name: string;
  payment_description: string;
  qr_code: string;
  paid_by: 'P2P' | 'CARD';
  object_type: string;
  object_id: string;
}

export default function AdminPaymentsPage() {
  const { t } = useLanguage();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [timeRange, setTimeRange] = useState('30');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Mock data for charts - in production, this would come from API
  const [chartData, setChartData] = useState<{
    revenueTrend: Array<{ date: string; revenue: number; transactions: number }>;
    paymentMethods: Array<{ name: string; value: number; fill: string }>;
    dailyPayments: Array<{ date: string; successful: number; failed: number; pending: number }>;
    statusDistribution: Array<{ name: string; value: number; fill: string }>;
  }>({
    revenueTrend: [],
    paymentMethods: [],
    dailyPayments: [],
    statusDistribution: []
  });

  const fetchPayments = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch('/api/qpay/payment/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          object_type: 'MERCHANT',
          object_id: process.env.NEXT_PUBLIC_MERCHANT_ID || 'your-merchant-id',
          page_number: page,
          page_limit: 20
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPayments(data.payments || []);
        setTotalPages(Math.ceil((data.payments?.length || 0) / 20));
        generateChartData(data.payments || []);
      } else {
        toast.error(data.error || 'Failed to fetch payments');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to fetch payments');
      // Generate mock data for demo
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const mockPayments = Array.from({ length: 50 }, (_, i) => ({
      payment_id: `PAY${String(i + 1).padStart(6, '0')}`,
      payment_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      payment_status: ['PAID', 'FAILED', 'NEW', 'REFUNDED'][Math.floor(Math.random() * 4)] as 'NEW' | 'FAILED' | 'PAID' | 'REFUNDED',
      payment_fee: Math.floor(Math.random() * 1000) + 100,
      payment_amount: Math.floor(Math.random() * 50000) + 5000,
      payment_currency: 'MNT',
      payment_wallet: 'QPay',
      payment_name: `Payment ${i + 1}`,
      payment_description: `Course purchase or test payment ${i + 1}`,
      qr_code: '',
      paid_by: Math.random() > 0.5 ? 'P2P' as const : 'CARD' as const,
      object_type: 'COURSE',
      object_id: `course_${i + 1}`
    }));
    setPayments(mockPayments);
    generateChartData(mockPayments);
  };

  const generateChartData = (paymentData: Payment[]) => {
    const days = parseInt(timeRange);
    const today = new Date();
    
    // Revenue trend data
    const revenueTrend = Array.from({ length: days }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (days - i - 1));
      const dayPayments = paymentData.filter(p => {
        const paymentDate = new Date(p.payment_date);
        return paymentDate.toDateString() === date.toDateString() && p.payment_status === 'PAID';
      });
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayPayments.reduce((sum, p) => sum + p.payment_amount, 0),
        transactions: dayPayments.length
      };
    });

    // Payment methods distribution
    const methodCounts = paymentData.reduce((acc, p) => {
      acc[p.paid_by] = (acc[p.paid_by] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const paymentMethods = Object.entries(methodCounts).map(([method, count]) => ({
      name: method,
      value: count,
      fill: method === 'P2P' ? '#3B82F6' : '#10B981'
    }));

    // Daily payments
    const dailyPayments = Array.from({ length: days }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (days - i - 1));
      const dayPayments = paymentData.filter(p => {
        const paymentDate = new Date(p.payment_date);
        return paymentDate.toDateString() === date.toDateString();
      });
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        successful: dayPayments.filter(p => p.payment_status === 'PAID').length,
        failed: dayPayments.filter(p => p.payment_status === 'FAILED').length,
        pending: dayPayments.filter(p => p.payment_status === 'NEW').length
      };
    });

    // Status distribution
    const statusCounts = paymentData.reduce((acc, p) => {
      acc[p.payment_status] = (acc[p.payment_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      fill: status === 'PAID' ? '#10B981' : status === 'FAILED' ? '#EF4444' : status === 'NEW' ? '#F59E0B' : '#6B7280'
    }));

    setChartData({
      revenueTrend,
      paymentMethods,
      dailyPayments,
      statusDistribution
    });
  };

  const handleRefund = async (paymentId: string) => {
    if (!confirm('Are you sure you want to refund this payment?')) {
      return;
    }

    try {
      const response = await fetch('/api/qpay/payment/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: paymentId,
          note: 'Refunded by admin'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Payment refunded successfully');
        fetchPayments(currentPage);
      } else {
        toast.error(data.error || 'Failed to refund payment');
      }
    } catch (error) {
      console.error('Error refunding payment:', error);
      toast.error('Failed to refund payment');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PAID: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      FAILED: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      NEW: { color: 'bg-yellow-100 text-yellow-800', label: 'New' },
      REFUNDED: { color: 'bg-gray-100 text-gray-800', label: 'Refunded' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.NEW;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.payment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payment_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payment_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || payment.payment_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = payments.filter(p => p.payment_status === 'PAID').reduce((sum, p) => sum + p.payment_amount, 0);
  const totalFees = payments.filter(p => p.payment_status === 'PAID').reduce((sum, p) => sum + p.payment_fee, 0);
  const netRevenue = totalRevenue - totalFees;
  const successRate = payments.length > 0 ? (payments.filter(p => p.payment_status === 'PAID').length / payments.length * 100) : 0;

  useEffect(() => {
    fetchPayments();
  }, [timeRange]);

  const exportPayments = () => {
    const csvContent = [
      ['Payment ID', 'Date', 'Status', 'Amount', 'Currency', 'Description', 'Paid By'],
      ...filteredPayments.map(payment => [
        payment.payment_id,
        new Date(payment.payment_date).toLocaleDateString(),
        payment.payment_status,
        payment.payment_amount,
        payment.payment_currency,
        payment.payment_description,
        payment.paid_by
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && payments.length === 0) {
    return (
      <AdminPageWrapper>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('paymentManagement') || 'Payment Management'}</h1>
            <p className="text-gray-600 mt-1">Monitor and manage QPay payments and financial metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => fetchPayments(currentPage)} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={exportPayments} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Financial Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">₮{totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">+15% from last month</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">₮{netRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-600 mt-1">After fees: ₮{totalFees.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{successRate.toFixed(1)}%</p>
                  <p className="text-xs text-purple-600 mt-1">{payments.filter(p => p.payment_status === 'PAID').length} successful</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold">{payments.length}</p>
                  <p className="text-xs text-gray-600 mt-1">Last {timeRange} days</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Revenue Trend
              </CardTitle>
              <CardDescription>Daily revenue over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <MuiLineChart
                xAxis={[{ data: chartData.revenueTrend.map(item => item.date), scaleType: 'band' }]}
                series={[
                  {
                    data: chartData.revenueTrend.map(item => item.revenue),
                    label: 'Revenue',
                    color: '#10B981'
                  }
                ]}
                height={300}
              />
            </CardContent>
          </Card>

          {/* Payment Methods Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-600" />
                Payment Methods
              </CardTitle>
              <CardDescription>Distribution of payment methods used</CardDescription>
            </CardHeader>
            <CardContent>
              <MuiPieChart
                series={[
                  {
                    data: chartData.paymentMethods.map(item => ({
                      id: item.name,
                      value: item.value,
                      label: `${item.name} ${((item.value / chartData.paymentMethods.reduce((sum, p) => sum + p.value, 0)) * 100).toFixed(0)}%`
                    })),
                    innerRadius: 80,
                    outerRadius: 100,
                    paddingAngle: 5,
                    cornerRadius: 5,
                    startAngle: -90,
                    endAngle: 90,
                  },
                ]}
                height={300}
              />
            </CardContent>
          </Card>
        </div>

        {/* Daily Payment Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Daily Payment Activity
            </CardTitle>
            <CardDescription>Payment status distribution over time</CardDescription>
          </CardHeader>
          <CardContent>
            <MuiBarChart
              xAxis={[{ data: chartData.dailyPayments.map(item => item.date), scaleType: 'band' }]}
              series={[
                {
                  data: chartData.dailyPayments.map(item => item.successful),
                  label: 'Successful',
                  color: '#10B981'
                },
                {
                  data: chartData.dailyPayments.map(item => item.failed),
                  label: 'Failed',
                  color: '#EF4444'
                },
                {
                  data: chartData.dailyPayments.map(item => item.pending),
                  label: 'Pending',
                  color: '#F59E0B'
                }
              ]}
              height={300}
            />
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search payments by ID, description, or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="PAID">Paid</option>
                  <option value="FAILED">Failed</option>
                  <option value="NEW">New</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              Recent payments processed through QPay
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Paid By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        {loading ? 'Loading payments...' : 'No payments found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.payment_id}>
                        <TableCell className="font-mono text-sm">
                          {payment.payment_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          ₮{payment.payment_amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          ₮{payment.payment_fee.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(payment.payment_status)}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {payment.payment_description}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {payment.paid_by}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // View payment details
                                console.log('View payment:', payment);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {payment.payment_status === 'PAID' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRefund(payment.payment_id)}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageWrapper>
  );
} 