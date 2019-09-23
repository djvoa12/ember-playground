import Component from '@ember/component';
import { isPresent } from '@ember/utils';
import { validator, buildValidations } from 'ember-cp-validations';
import { task } from 'ember-concurrency';

const PROXY = 'https://cors-anywhere.herokuapp.com/';
const ELEMENT_TAGS = ['META', 'STYLE'];

const Validations = buildValidations({
  url: [
    validator('presence', true),
    validator('format', { type: 'url' }),
    validator('format', {
      regex: new RegExp('^(http|https)://', 'i'),
      message: 'URL must begin with http:// or https://'
    })
  ],
  word: validator('presence', true)
});

export default Component.extend(Validations, {
  classNames: ['task task__one'],

  count: 0,
  url: '',
  word: '',

  stripHtmlBody(htmlString) {
    const el = document.createElement('html');
    el.innerHTML = htmlString;
    return el.querySelector('body');
  },

  purgeTags(child) {
    if (ELEMENT_TAGS.includes(child.nodeName)) {
      child.parentElement.removeChild(child);
    }
  },

  scrubElement(element) {
    while (element.attributes.length > 0) {
      element.removeAttribute(element.attributes[0].name);
    }
  },

  scrubHtmlBody(bodyHtml) {
    const bodyChildren = bodyHtml.getElementsByTagName('*');

    for (let i = 0; i < bodyChildren.length; i++) {
      const child = bodyChildren[i];
      this.purgeTags(child);
      this.scrubElement(child);
    }

    return bodyHtml.textContent.trim();
  },

  findWordCount: task(function* (url, word) {
    const regex = new RegExp(word, 'gi');
    let response;

    try {
      response = yield fetch(`${PROXY}${url}`);
    } catch(error) {
      console.error(error);
      return;
    }

    const htmlString = yield response.text();
    const htmlBody = this.stripHtmlBody(htmlString);
    const scrubbedBodyText = this.scrubHtmlBody(htmlBody);
    const count = isPresent(scrubbedBodyText.match(regex))
      ? scrubbedBodyText.match(regex).length
      : 0;
    this.set('count', count);
  }),

  actions: {
    submitForm(event) {
      event.preventDefault();
      const { url, word } = this.getProperties('url', 'word');
      this.findWordCount.perform(url, word);
    }
  }
});
