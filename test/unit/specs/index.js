import Vue from 'vue'
import OptionFloats from '@/components/OptionFloats'

describe('OptionFloats.vue', () => {
  it('should render correct contents', () => {
    const vm = new Vue({
      el: document.createElement('div'),
      render: h => h(OptionFloats)
    }).$mount()

    console.log("testing caption");
    
    expect(vm.$el.querySelector('.caption').label).to.contain('Show unconnected ports')
  })
})
