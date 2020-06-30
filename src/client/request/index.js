import alive from './alive'
import user from './user'
import friends from './friends'

export default {
  alive,
  ...user,
  ...friends
}
