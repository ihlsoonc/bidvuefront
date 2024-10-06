<template>
  <div>
    <div v-if="!bidStatus">경기 정보를 조회중입니다.</div>
    <div v-else>
      <div class="info-box">
        <p>경기번호 ({{ bidStatus.match_no }}) {{matchRound}} <span class="bold-text">{{ openStatus }}</span></p>
        <div class="info-item">
          <label>경기 시간</label>{{ formatTimeToLocal(bidStatus.start_datetime) }} ~ {{ formatTimeToLocal(bidStatus.end_datetime) }}
        </div>
        <div class="info-item">
          <label>입찰 기간</label>{{ formatTimeToLocal(bidStatus.bid_open_datetime) }} ~ {{ formatTimeToLocal(bidStatus.bid_close_datetime) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue';
import { formatTimeToLocal } from '../utils/commonFunction';

export default defineComponent({
  name: 'BidStatus',
  props: {
    bidStatus: {
      type: Object,
      default: () => null
    }
  },
  setup(props) {
    const openStatus = computed(() => {
      if (!props.bidStatus) return '확인중 ..';
      switch (props.bidStatus.bidStatusCode) {
        case 'N': return '입찰 미개시';
        case 'O': return '입찰 가능';
        case 'C': return '입찰 종료';
        case 'F': return '낙찰 종료';
        default: return '현재 입찰할 수 없습니다.';
      }
    });

    const matchRound = computed(() => {
      if (!props.bidStatus || !props.bidStatus) return '';

      const { match_name, round, venue_name } = props.bidStatus;
      return `${match_name} ${round} (${venue_name})`;
    });

    return {
      openStatus,
      matchRound,
      formatTimeToLocal
    };
  }
});
</script>

<style scoped>
.bold-text {
    font-weight: bold;
}

</style>
