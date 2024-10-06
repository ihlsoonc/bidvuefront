<template>
  <div>
    <div class="box-container">
      <div>
        <h6 style="text-align: center;">좌석을 선택한 후 입찰 금액을 입력하세요.</h6>
        <div class="box-container" >
          <div
            id="seat-1"
            class="box"
            :class="{ selected: isSelected(1), bidded: hasBidders(1) }"
            @click="onSeatClick(1)"
          >
            1
          </div>
          <div
            id="seat-2"
            class="box"
            :class="{ selected: isSelected(2), bidded: hasBidders(2) }"
            @click="onSeatClick(2)"
          >
            2
          </div>
          <div
            id="seat-3"
            class="box"
            :class="{ selected: isSelected(3), bidded: hasBidders(3) }"
            @click="onSeatClick(3)"
          >
            3
          </div>
          <div
            id="seat-4"
            class="box"
            :class="{ selected: isSelected(4), bidded: hasBidders(4) }"
            @click="onSeatClick(4)"
          >
            4
          </div>
          <div
            id="seat-5"
            class="box"
            :class="{ selected: isSelected(5), bidded: hasBidders(5) }"
            @click="onSeatClick(5)"
          >
            5
          </div>
          <div
            id="seat-6"
            class="box"
            :class="{ selected: isSelected(6), bidded: hasBidders(6) }"
            @click="onSeatClick(6)"
          >
            6
          </div>
          <div
            id="seat-7"
            class="box"
            :class="{ selected: isSelected(7), bidded: hasBidders(7) }"
            @click="onSeatClick(7)"
          >
            7
          </div>
          <div
            id="seat-8"
            class="box"
            :class="{ selected: isSelected(8), bidded: hasBidders(8) }"
            @click="onSeatClick(8)"
          >
            8
          </div>
          <div
            id="seat-9"
            class="box"
            :class="{ selected: isSelected(9), bidded: hasBidders(9) }"
            @click="onSeatClick(9)"
          >
            9
          </div>
          <div
            id="seat-10"
            class="box"
            :class="{ selected: isSelected(10), bidded: hasBidders(10) }"
            @click="onSeatClick(10)"
          >
            10
          </div>
          <div
            id="seat-11"
            class="box"
            :class="{ selected: isSelected(11), bidded: hasBidders(11) }"
            @click="onSeatClick(11)"
          >
            11
          </div>
          <div
            id="seat-12"
            class="box"
            :class="{ selected: isSelected(12), bidded: hasBidders(12) }"
            @click="onSeatClick(12)"
          >
            12
          </div>
          <div
            id="seat-13"
            class="box"
            :class="{ selected: isSelected(13), bidded: hasBidders(13) }"
            @click="onSeatClick(13)"
          >
            13
          </div>
          <div
            id="seat-14"
            class="box"
            :class="{ selected: isSelected(14), bidded: hasBidders(14) }"
            @click="onSeatClick(14)"
          >
            14
          </div>
          <div
            id="seat-15"
            class="box"
            :class="{ selected: isSelected(15), bidded: hasBidders(15) }"
            @click="onSeatClick(15)"
          >
            15
          </div>
          <div
            id="seat-16"
            class="box"
            :class="{ selected: isSelected(16), bidded: hasBidders(16) }"
            @click="onSeatClick(16)"
          >
            16
          </div>
          <div
            id="seat-17"
            class="box"
            :class="{ selected: isSelected(17), bidded: hasBidders(17) }"
            @click="onSeatClick(17)"
          >
            17
          </div>
          <div
            id="seat-18"
            class="box"
            :class="{ selected: isSelected(18), bidded: hasBidders(18) }"
            @click="onSeatClick(18)"
          >
            18
          </div>
          <div
            id="seat-19"
            class="box"
            :class="{ selected: isSelected(19), bidded: hasBidders(19) }"
            @click="onSeatClick(19)"
          >
            19
          </div>
          <div
            id="seat-20"
            class="box"
            :class="{ selected: isSelected(20), bidded: hasBidders(20) }"
            @click="onSeatClick(20)"
          >
            20
          </div>
          <div
            id="seat-21"
            class="box"
            :class="{ selected: isSelected(21), bidded: hasBidders(21) }"
            @click="onSeatClick(21)"
          >
            21
          </div>
          <div
            id="seat-22"
            class="box"
            :class="{ selected: isSelected(22), bidded: hasBidders(22) }"
            @click="onSeatClick(22)"
          >
            22
          </div>
          <div
            id="seat-23"
            class="box"
            :class="{ selected: isSelected(23), bidded: hasBidders(23) }"
            @click="onSeatClick(23)"
          >
            23
          </div>
          <div
            id="seat-24"
            class="box"
            :class="{ selected: isSelected(24), bidded: hasBidders(24) }"
            @click="onSeatClick(24)"
          >
            24
          </div>
          <div
            id="seat-25"
            class="box"
            :class="{ selected: isSelected(25), bidded: hasBidders(25) }"
            @click="onSeatClick(25)"
          >
            25
          </div>
          <div
            id="seat-26"
            class="box"
            :class="{ selected: isSelected(26), bidded: hasBidders(26) }"
            @click="onSeatClick(26)"
          >
            26
          </div>
          <div
            id="seat-27"
            class="box"
            :class="{ selected: isSelected(27), bidded: hasBidders(27) }"
            @click="onSeatClick(27)"
          >
            27
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    selectedSeats: {
      type: Array,
      required: true
    },
    onSeatClick: {
      type: Function,
      required: true
    }
  },
  methods: {
    isSelected(number) {
      return this.selectedSeats.some(seat => seat.uniqueSeatId === number);
    },
    hasBidders(number) {
      const seat = this.selectedSeats.find(seat => seat.uniqueSeatId === number);
      return seat ? seat.total_bidder > 0 : false;
    },
    handleSeatClick(seatNumber) {
      // 좌석 클릭 시 부모 컴포넌트로 이벤트 전송
      this.$emit('seat-click', seatNumber);
    }
  }
};
</script>

<style scoped>
/* 스타일 정의 */
.empty-cell {
  background-color: white; /* 빈 셀의 배경색 설정 */
  height: 30px; /* 빈 셀의 높이 설정 */
  width: 60px; /* 빈 셀의 너비 설정 */
  initial-value: '0';
}

.box-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  max-width: 600px;
  margin: 0 auto;
}

.box {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
}

.box.selected {
  background-color: #67a5c2;
}

.box.bidded {
  background-color: #72336f;
}

.box-info {
  margin-top: 20px;
  text-align: center;
}

</style>
