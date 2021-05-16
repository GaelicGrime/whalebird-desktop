import { Response, Entity } from 'megalodon'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import DirectMessages, { DirectMessagesState } from '@/store/TimelineSpace/Contents/DirectMessages'

const mockClient = {
  getConversationTimeline: () => {
    return new Promise<Response<Array<Entity.Conversation>>>(resolve => {
      const res: Response<Array<Entity.Conversation>> = {
        data: [conversation1],
        status: 200,
        statusText: 'OK',
        headers: {}
      }
      resolve(res)
    })
  }
}

jest.mock('megalodon', () => ({
  ...jest.requireActual<object>('megalodon'),
  default: jest.fn(() => mockClient),
  __esModule: true
}))

const account: Entity.Account = {
  id: '1',
  username: 'h3poteto',
  acct: 'h3poteto@pleroma.io',
  display_name: 'h3poteto',
  locked: false,
  created_at: '2019-03-26T21:30:32',
  followers_count: 10,
  following_count: 10,
  statuses_count: 100,
  note: 'engineer',
  url: 'https://pleroma.io',
  avatar: '',
  avatar_static: '',
  header: '',
  header_static: '',
  emojis: [],
  moved: null,
  fields: null,
  bot: false
}

const status1: Entity.Status = {
  id: '1',
  uri: 'http://example.com',
  url: 'http://example.com',
  account: account,
  in_reply_to_id: null,
  in_reply_to_account_id: null,
  reblog: null,
  content: 'hoge',
  created_at: '2019-03-26T21:40:32',
  emojis: [],
  replies_count: 0,
  reblogs_count: 0,
  favourites_count: 0,
  reblogged: null,
  favourited: null,
  muted: null,
  sensitive: false,
  spoiler_text: '',
  visibility: 'public',
  media_attachments: [],
  mentions: [],
  tags: [],
  card: null,
  poll: null,
  application: {
    name: 'Web'
  } as Entity.Application,
  language: null,
  pinned: null,
  emoji_reactions: [],
  bookmarked: false,
  quote: false
}

const status2: Entity.Status = {
  id: '2',
  uri: 'http://example.com',
  url: 'http://example.com',
  account: account,
  in_reply_to_id: null,
  in_reply_to_account_id: null,
  reblog: null,
  content: 'fuga',
  created_at: '2019-03-26T21:40:32',
  emojis: [],
  replies_count: 0,
  reblogs_count: 0,
  favourites_count: 0,
  reblogged: null,
  favourited: null,
  muted: null,
  sensitive: false,
  spoiler_text: '',
  visibility: 'public',
  media_attachments: [],
  mentions: [],
  tags: [],
  card: null,
  poll: null,
  application: {
    name: 'Web'
  } as Entity.Application,
  language: null,
  pinned: null,
  emoji_reactions: [],
  bookmarked: false,
  quote: false
}

const conversation1: Entity.Conversation = {
  id: '1',
  accounts: [account],
  last_status: status1,
  unread: false
}

const conversation2: Entity.Conversation = {
  id: '2',
  accounts: [account],
  last_status: status2,
  unread: false
}

let state = (): DirectMessagesState => {
  return {
    lazyLoading: false,
    heading: true,
    timeline: [],
    unreadTimeline: []
  }
}

const initStore = () => {
  return {
    namespaced: true,
    state: state(),
    actions: DirectMessages.actions,
    mutations: DirectMessages.mutations
  }
}

const timelineState = {
  namespaced: true,
  state: {
    account: {
      accessToken: 'token',
      baseURL: 'http://localhost'
    },
    sns: 'mastodon'
  }
}

const appState = {
  namespaced: true,
  state: {
    proxyConfiguration: false
  }
}

describe('Home', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        DirectMessages: initStore(),
        TimelineSpace: timelineState,
        App: appState
      }
    })
  })

  describe('fetchTimeline', () => {
    it('should be updated', async () => {
      const statuses = await store.dispatch('DirectMessages/fetchTimeline')
      expect(statuses).toEqual([status1])
      expect(store.state.DirectMessages.timeline).toEqual([status1])
    })
  })

  describe('lazyFetchTimeline', () => {
    describe('success', () => {
      beforeAll(() => {
        state = () => {
          return {
            lazyLoading: false,
            heading: true,
            timeline: [status1],
            unreadTimeline: [],
            showReblogs: true,
            showReplies: true
          }
        }
      })
      it('should be updated', async () => {
        mockClient.getConversationTimeline = () => {
          return new Promise<Response<Array<Entity.Conversation>>>(resolve => {
            const res: Response<Array<Entity.Conversation>> = {
              data: [conversation2],
              status: 200,
              statusText: 'OK',
              headers: {}
            }
            resolve(res)
          })
        }
        await store.dispatch('DirectMessages/lazyFetchTimeline', status1)
        expect(store.state.DirectMessages.lazyLoading).toEqual(false)
        expect(store.state.DirectMessages.timeline).toEqual([status1, status2])
      })
    })
  })
})
