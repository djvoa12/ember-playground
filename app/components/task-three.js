import Component from '@ember/component';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  height: [
    validator('presence', true),
    validator('number', { allowString: true, gt: 0, integer: true })
  ],
  width: [
    validator('presence', true),
    validator('number', { allowString: true, gt: 0, integer: true })
  ],
  xAxis: [
    validator('presence', true),
    validator('number', { allowString: true, gte: 0, integer: true })
  ],
  yAxis: [
    validator('presence', true),
    validator('number', { allowString: true, gte: 0, integer: true })
  ]
});

export default Component.extend(Validations, {
  classNames: ['task task__three'],

  height: null,
  xAxis: null,
  width: null,
  yAxis: null,

  renderRectangle() {
    const rectangle = document.querySelector('div.rectangle');
    rectangle.style.height = `${this.height}px`;
    rectangle.style.width = `${this.width}px`;
    rectangle.style.marginLeft = `${this.xAxis}px`;
    rectangle.style.marginTop = `${this.yAxis}px`;
  },

  actions: {
    submitForm(event) {
      event.preventDefault();
      this.renderRectangle();
    }
  }
});
