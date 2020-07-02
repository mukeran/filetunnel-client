import alive from './alive'
import user from './user'
import friends from './friend'

export default {
  alive,
  ...user,
  ...friends
}
