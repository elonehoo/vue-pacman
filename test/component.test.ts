/**
 * @vitest-environment jsdom
 */
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Footer from '../src/components/Footer.vue'

describe('footer.vue', () => {
  it('should render', () => {
    const wrapper = mount(Footer)
    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.find('a').attributes('href')).toBe('https://github.com/xiaoxunyao/viden')
  })
})
