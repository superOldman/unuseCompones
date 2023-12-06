import moment from "moment";
const types = [
  {
    label: "今日",
    value: "TODAY",
    category:"first",
    getDate: () => {
      const end = new Date();
      const start = new Date();
      return [start, end];
    },
  },
  {
    label: "昨日",
    value: "YESTERDAY",
    category:"first",
    getDate: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24);
      end.setTime(end.getTime() - 3600 * 1000 * 24);
      return [start, end];
    },
  },
  {
    label: "本周",
    value: "THIS_WEEK",
    category:"first",
    getDate: () => {
      const time = new Date();
      const end = new Date();
      const start = new Date(
        time.getFullYear(),
        time.getMonth(),
        time.getDate() + 1 - (time.getDay() || 7)
      );
      return [start, end];
    },
  },
  {
    label: "上周",
    value: "LAST_WEEK",
    category:"first",
    getDate: () => {
      const time = new Date();
      const start = new Date(
        time.getFullYear(),
        time.getMonth(),
        time.getDate() - time.getDay() - 6
      );
      const end = new Date(
        time.getFullYear(),
        time.getMonth(),
        time.getDate() - time.getDay() - 0
      );
      return [start, end];
    },
  },
  {
    label: "本月",
    value: "THIS_MONTH",
    category:"first",
    getDate: () => {
      const end = new Date();
      const start = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      );
      return [start, end];
    },
  },
  {
    label: "上月",
    value: "LAST_MOTH",
    category:"first",
    getDate: () => {
      const time = new Date();
      const getMonthDays =
        (new Date(time.getFullYear(), time.getMonth(), 1) -
          new Date(time.getFullYear(), time.getMonth(), 1)) /
        (1000 * 60 * 60 * 24);
      const end = new Date(time.getFullYear(), time.getMonth(), getMonthDays);
      const start = new Date(time.getFullYear(), time.getMonth() - 1, 1);
      return [start, end];
    },
  },
  {
    label: "本年",
    value: "THIS_YEAR",
    category:"first",
    getDate: () => {
      // moment().year() => 2023
      const start = moment()
        .year(moment().year())
        .startOf("year")
        .format("YYYY-MM-DD");
      const end = new Date();
      return [start, end];
    },
  },
  {
    label: "去年",
    value: "LAST_YEAR",
    category:"first",
    getDate: () => {
      const start = moment()
        .subtract(1, "year")
        .startOf("year")
        .format("YYYY-MM-DD");
      const end = moment()
        .subtract(1, "year")
        .endOf("year")
        .format("YYYY-MM-DD");
      return [start, end];
    },
  },

  {
    label: "过去 7 天",
    value: "LAST_SEVEN_DAY",
    category:"second",
    getDate: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      end.setTime(end.getTime() - 3600 * 1000 * 24);
      return [start, end];
    },
  },
  {
    label: "过去 30 天",
    value: "LAST_THIRTY_DAY",
    category:"second",
    getDate: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      end.setTime(end.getTime() - 3600 * 1000 * 24);
      return [start, end];
    },
  },
  {
    label: "过去 60 天",
    value: "LAST_SIXTY_DAY",
    category:"second",
    getDate: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 60);
      end.setTime(end.getTime() - 3600 * 1000 * 24);
      return [start, end];
    },
  },
  {
    label: "过去 90 天",
    value: "LAST_NINETY_DAY",
    category:"second",
    getDate: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      end.setTime(end.getTime() - 3600 * 1000 * 24);
      return [start, end];
    },
  },
  {
    label: "过去 180 天",
    value: "LAST_180_DAY",
    category:"second",
    getDate: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 180);
      end.setTime(end.getTime() - 3600 * 1000 * 24);
      return [start, end];
    },
  },
  {
    label: "上线至今",
    value: "ONLINE_TIME",
    category:"second",
    getDate: () => {
      const start = new Date(1262275200000); // 2010/01/01
      const end = new Date();
      return [start, end];
    },
  },
];

export default types;
