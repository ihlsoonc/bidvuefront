<template>
  <div id="userhome">
    <NavBarUser 
      @link-action="handleLinkAction" 
      :isLoggedIn="isLoggedIn" 
      :hasSelectedMatch="hasSelectedMatch" />
      <router-view @update-status="handleUpdateStatus">
      </router-view>
  </div>
</template>

<script>
  import { ref, onMounted} from 'vue';
  import { useRouter } from 'vue-router';
  import NavBarUser from './NavBarUser.vue';
  import {url } from '../utils/messagesAPIs';

  export default {
    name: 'UserHome',
    components: {
      NavBarUser,
    },
  
  setup() {
    const router = useRouter();
    const isLoggedIn = ref(false);
    const hasSelectedMatch = ref(false);

    const handleLinkAction = (action) => {
      router.push(url[action]);  // 여기서 route를 사용하여 경로 이동
    };

    const handleUpdateStatus = (status) => {
      isLoggedIn.value = status.isLoggedIn;
      hasSelectedMatch.value = status.hasSelectedMatch;
    };

    const checkLoginStatus = () => {
      if (!isLoggedIn.value) {
        router.push(url.userlogin);
      }
    };

    // 컴포넌트가 마운트된 후에 로그인 상태를 체크하고 필요 시 라우팅
    onMounted(() => {
      checkLoginStatus();
      sessionStorage.setItem('tableName', "user");
    });

    return {
      handleLinkAction,
      isLoggedIn,
      hasSelectedMatch,
      handleUpdateStatus,
    };
  }
}
</script>

<style>
/* 스타일을 여기에 추가할 수 있습니다 */
</style>
