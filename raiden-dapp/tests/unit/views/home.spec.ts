jest.mock('@/services/raiden-service');
jest.mock('vue-router');

import RaidenService from '@/services/raiden-service';
import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import Vuetify from 'vuetify';
import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils';
import Home from '@/views/Home.vue';
import { RootState } from '@/types';
import AppCore from '@/components/AppCore.vue';
import { defaultState } from '@/store';
import NoValidProvider from '@/components/NoValidProvider.vue';
import { DeniedReason } from '@/model/types';

import Mocked = jest.Mocked;

Vue.use(Vuetify);

describe('Home.vue', function() {
  let wrapper: Wrapper<Home>;
  let service: Mocked<RaidenService>;
  let store: Store<RootState>;

  function vueFactory(
    service: RaidenService,
    store: Store<RootState>,
    data: {} = {}
  ): Wrapper<Home> {
    const localVue = createLocalVue();
    localVue.use(Vuex);
    return shallowMount(Home, {
      localVue,
      store: store,
      mocks: {
        $raiden: service
      },
      propsData: data
    });
  }

  beforeEach(() => {
    store = new Store<RootState>({
      state: defaultState(),
      mutations: {
        failed(state: RootState) {
          state.providerDetected = false;
        },
        denied(state: RootState) {
          state.accessDenied = DeniedReason.UNSUPPORTED_NETWORK;
        }
      }
    });
    wrapper = vueFactory(service, store);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should display app core if everything is ok', function() {
    expect(wrapper.find(AppCore)).toBeTruthy();
  });

  it('should display no provider if no provider detected', function() {
    store.commit('failed');
    expect(wrapper.find(NoValidProvider)).toBeTruthy();
  });

  it('should display a user denied message if user denied the provider connection', function() {
    store.commit('denied');
    expect(wrapper.find(NoValidProvider)).toBeTruthy();
  });
});
