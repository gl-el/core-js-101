/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  const r = {
    width,
    height,
    getArea() {
      return this.width * this.height;
    },
  };
  return r;
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = JSON.parse(json);
  Object.setPrototypeOf(obj, proto);
  return obj;
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class CssItem {
  constructor() {
    this.item = '';
    this.elements = 0;
    this.ids = 0;
    this.pseudos = 0;
    this.stack = [];
  }

  element(value) {
    this.item += value;
    this.elements += 1;
    this.stack.push('element');
    this.check();
    return this;
  }

  id(value) {
    this.item += `#${value}`;
    this.ids += 1;
    this.stack.push('id');
    this.check();
    return this;
  }

  class(value) {
    this.item += `.${value}`;
    this.stack.push('class');
    this.check();
    return this;
  }

  attr(value) {
    this.item += `[${value}]`;
    this.stack.push('attr');
    this.check();
    return this;
  }

  pseudoClass(value) {
    this.item += `:${value}`;
    this.stack.push('pseudoClass');
    this.check();
    return this;
  }

  pseudoElement(value) {
    this.item += `::${value}`;
    this.pseudos += 1;
    this.stack.push('pseudoEl');
    this.check();
    return this;
  }

  stringify() {
    this.reset();
    return this.item;
  }

  reset() {
    this.elements = 0;
    this.ids = 0;
    this.pseudos = 0;
    this.stack = [];
  }

  check() {
    if (this.elements > 1 || this.ids > 1 || this.pseudos > 1) {
      this.reset();
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    const el = this.stack.indexOf('element') === -1 ? '_' : this.stack.indexOf('element');
    const id = this.stack.indexOf('id') === -1 ? '_' : this.stack.indexOf('id');
    const classIndex = this.stack.indexOf('class') === -1 ? '_' : this.stack.indexOf('class');
    const attr = this.stack.indexOf('attr') === -1 ? '_' : this.stack.indexOf('attr');
    const PsClass = this.stack.indexOf('pseudoClass') === -1 ? '_' : this.stack.indexOf('pseudoClass');
    const PsEl = this.stack.indexOf('pseudoEl') === -1 ? '_' : this.stack.indexOf('pseudoEl');
    if ((el > id || el > classIndex || el > attr || el > PsClass || el > PsEl)
      || (id > classIndex || id > attr || id > PsClass || id > PsEl)
      || (classIndex > attr || classIndex > PsClass || classIndex > PsEl)
      || (attr > PsClass || attr > PsEl)
      || (PsClass > PsEl)) {
      this.reset();
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
  }

  combine(selector1, combinator, selector2) {
    this.item += `${selector1.stringify()} ${combinator} ${selector2.stringify()}`;
    return this;
  }
}

const cssSelectorBuilder = {

  element(value) {
    const css = new CssItem();
    return css.element(value);
  },

  id(value) {
    const css = new CssItem().id(value);
    return css;
  },

  class(value) {
    const css = new CssItem().class(value);
    return css;
  },

  attr(value) {
    const css = new CssItem().attr(value);
    return css;
  },

  pseudoClass(value) {
    const css = new CssItem().pseudoClass(value);
    return css;
  },

  pseudoElement(value) {
    const css = new CssItem().pseudoElement(value);
    return css;
  },

  combine(selector1, combinator, selector2) {
    const css = new CssItem().combine(selector1, combinator, selector2);
    return css;
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
