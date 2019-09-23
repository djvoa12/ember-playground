import Component from '@ember/component';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  annualRate: [
    validator('presence', true),
    validator('number', { allowString: true, gt: 0 })
  ],
  months: [
    validator('presence', true),
    validator('number', { allowString: true, gt: 0, integer: true })
  ],
  principal: [
    validator('presence', true),
    validator('number', { allowString: true, gt: 0 })
  ]
});

export default Component.extend(Validations, {
  classNames: ['task task__two'],

  amortizationSchedule: null,
  annualRate: null,
  months: null,
  principal: null,
  totalInterestPaid: null,
  totalRepaid: null,

  calcMonthlyRate(annualRate) {
    return (annualRate / 100) / 12;
  },

  calcFixedPayment(principal, monthlyRate, months) {
    const topPart = monthlyRate * Math.pow(1 + monthlyRate, months)
    const bottomPart = Math.pow(1 + monthlyRate, months) - 1;
    return parseFloat((principal * (topPart / bottomPart)).toFixed(2));
  },

  calcInterestPayment(remainingBalance, monthlyRate) {
    return parseFloat((remainingBalance * monthlyRate).toFixed(2));
  },

  calcPrincipalPayment(remainingBalance, fixedPayment, interestPayment) {
    const principalPayment = parseFloat((fixedPayment - interestPayment).toFixed(2));
    return principalPayment > remainingBalance
      ? remainingBalance
      : principalPayment;
  },

  calcNewPrincipalBalance(remainingBalance, principalPayment) {
    return parseFloat((remainingBalance - principalPayment).toFixed(2));
  },

  calcCumulativePrincipal(totalPrincipalPaid, principalPayment) {
    return parseFloat((totalPrincipalPaid + principalPayment).toFixed(2));
  },

  calcCumulativeInterest(totalInterestPaid, interestPayment) {
    return parseFloat((totalInterestPaid + interestPayment).toFixed(2));
  },

  calcMonthlyPayment(principalPayment, interestPayment) {
    return parseFloat((principalPayment + interestPayment).toFixed(2));
  },

  calcTotalRepaid(totalPrincipalPaid, totalInterestPaid) {
    return parseFloat((totalPrincipalPaid + totalInterestPaid).toFixed(2));
  },

  createAmortizationSchedule() {
    const amortizationSchedule = [];
    const months = this.months;
    const monthlyRate = this.calcMonthlyRate(this.annualRate);
    let fixedPayment = this.calcFixedPayment(this.principal, monthlyRate, months);
    let remainingBalance = this.principal;
    let totalPrincipalPaid = 0;
    let totalInterestPaid = 0;

    for (let i = 1; i <= months; i++) {
      const interestPayment = this.calcInterestPayment(remainingBalance, monthlyRate);
      const principalPayment = this.calcPrincipalPayment(remainingBalance, fixedPayment, interestPayment);
      const newPrincipalBalance = this.calcNewPrincipalBalance(remainingBalance, principalPayment);
      const cumulativePrincipal = this.calcCumulativePrincipal(totalPrincipalPaid, principalPayment);
      const cumulativeInterest = this.calcCumulativeInterest(totalInterestPaid, interestPayment);
      amortizationSchedule.push({
        paymentNumber: i,
        monthlyPayment: this.calcMonthlyPayment(principalPayment, interestPayment),
        principalPayment,
        interestPayment,
        cumulativePrincipal,
        cumulativeInterest,
        principalBalance: newPrincipalBalance
      });
      remainingBalance = newPrincipalBalance;
      totalPrincipalPaid = cumulativePrincipal;
      totalInterestPaid = cumulativeInterest;
    }

    this.setProperties({
      amortizationSchedule,
      totalRepaid: this.calcTotalRepaid(totalPrincipalPaid, totalInterestPaid),
      totalInterestPaid
    });
  },

  actions: {
    submitForm(event) {
      event.preventDefault();
      this.createAmortizationSchedule();
    },

    updateProperty(prop, { target }) {
      this.set(prop, parseFloat(target.value));
    }
  }
});
