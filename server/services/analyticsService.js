import { query } from '../db/index.js';
import { enquiryService } from './enquiryService.js';
import { consultationService } from './consultationService.js';
import { weddingService } from './weddingService.js';
import { proposalService } from './proposalService.js';
import { bookingService } from './bookingService.js';
import { paymentService } from './paymentService.js';

export const analyticsService = {
  async getDashboardMetrics(options = {}) {
    const { dateRange = 'all', startDate, endDate } = options;

    let filterStartDate = null;
    let filterEndDate = new Date();

    const now = new Date();
    if (dateRange === 'today') {
      filterStartDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (dateRange === 'week') {
      filterStartDate = new Date(now.setDate(now.getDate() - 7));
    } else if (dateRange === 'month') {
      filterStartDate = new Date(now.setMonth(now.getMonth() - 1));
    } else if (dateRange === 'year') {
      filterStartDate = new Date(now.setFullYear(now.getFullYear() - 1));
    } else if (startDate && endDate) {
      filterStartDate = new Date(startDate);
      filterEndDate = new Date(endDate);
    }

    let enquiriesRes = await enquiryService.getAllEnquiries({ limit: 1000 });
    let consultationsRes = await consultationService.getAllConsultations({ limit: 1000 });
    let weddingsRes = await weddingService.getAllWeddings({ limit: 1000 });
    let proposalsRes = await proposalService.getAllProposals({ limit: 1000 });
    let bookingsRes = await bookingService.getAllBookings({ limit: 1000 });
    let paymentsRes = await paymentService.getAllPayments({ limit: 1000 });

    let enquiries = enquiriesRes.enquiries || [];
    let consultations = consultationsRes.consultations || [];
    let weddings = weddingsRes.weddings || [];
    let proposals = proposalsRes.proposals || [];
    let bookings = bookingsRes.bookings || [];
    let payments = paymentsRes.payments || [];

    // Date filtering helper
    const isWithinDate = (dateStr) => {
      if (!filterStartDate) return true;
      const d = new Date(dateStr);
      return d >= filterStartDate && d <= filterEndDate;
    };

    enquiries = enquiries.filter((e) => isWithinDate(e.createdAt));
    consultations = consultations.filter((c) => isWithinDate(c.createdAt));
    weddings = weddings.filter((w) => isWithinDate(w.createdAt));
    proposals = proposals.filter((p) => isWithinDate(p.createdAt));
    bookings = bookings.filter((b) => isWithinDate(b.createdAt));
    payments = payments.filter((p) => isWithinDate(p.createdAt));

    // Metric Calculations
    const totalEnquiries = enquiries.length;
    const totalConsultations = consultations.length;
    const confirmedConsultations = consultations.filter((c) => ['SCHEDULED', 'CONFIRMED', 'COMPLETED'].includes(c.status)).length;
    const consultationConversionRate = totalEnquiries > 0 ? ((totalConsultations / totalEnquiries) * 100).toFixed(1) : '0.0';

    const totalWeddings = weddings.length;
    const activeWeddings = weddings.filter((w) => ['Planning', 'PLANNING', 'IN_PROGRESS', 'CONFIRMED'].includes(w.status)).length;

    const totalProposals = proposals.length;
    const approvedProposals = proposals.filter((p) => ['ACCEPTED', 'APPROVED'].includes(p.status)).length;
    const proposalApprovalRate = totalProposals > 0 ? ((approvedProposals / totalProposals) * 100).toFixed(1) : '0.0';

    const totalBookings = bookings.length;

    const completedPayments = payments.filter((p) => p.status === 'COMPLETED' || p.status === 'SUCCESS' || p.status === 'PAID');
    const totalRevenue = completedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const pendingPaymentsList = payments.filter((p) => p.status === 'PENDING' || p.status === 'UNPAID');
    const pendingPaymentsTotal = pendingPaymentsList.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    return {
      success: true,
      filter: { dateRange, startDate: filterStartDate ? filterStartDate.toISOString() : null, endDate: filterEndDate.toISOString() },
      metrics: {
        totalEnquiries,
        totalConsultations,
        confirmedConsultations,
        consultationConversionRate: `${consultationConversionRate}%`,
        totalWeddings,
        activeWeddings,
        totalProposals,
        approvedProposals,
        proposalApprovalRate: `${proposalApprovalRate}%`,
        totalBookings,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        pendingPaymentsCount: pendingPaymentsList.length,
        pendingPaymentsTotal: Number(pendingPaymentsTotal.toFixed(2)),
      },
    };
  },
};
