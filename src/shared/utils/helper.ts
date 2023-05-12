/**
 * 判断是否是移动端
 */
export const testIsPhone = () => {
  return /Android|webOS|iPhone|iPod|iPad|BlackBerry/i.test(navigator.userAgent);
};

// 格式化数字 K
export function formatNumber(key: number) {
  let num: number | string = 0;
  if (key === undefined) {
    num = 0;
  } else {
    num = key >= 1e3 ? `${parseInt(`${(key / 1e3) * 10}`) / 10}K` : key;
  }

  return num;
}

// 获取时间格式YY-MM-DD
export function formatDate(date: number | string) {
  const time = new Date(date);
  return `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;
}

// 格式化数字1000=>1,000
export function toThousands(key: number | 0) {
  let num: number | string = 0;
  if (key === undefined) {
    num = 0;
  } else {
    num = Number(key).toLocaleString('en-US');
  }
  return num;
}

// 获取当前日期 yy-mm-dd
export const getNowFormatDate = () => {
  const date = new Date();
  const seperator1 = '-';

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const yearStr = `${year}`;
  let monthStr = `${month}`;
  let dayStr = `${day}`;

  if (month >= 1 && month <= 9) {
    monthStr = `0${month}`;
  }
  if (day >= 0 && day <= 9) {
    dayStr = `0${day}`;
  }
  const currentdate = yearStr + seperator1 + monthStr + seperator1 + dayStr;
  return currentdate;
};

/**
 * @param num 被除数
 * @param total 总数
 * @param decimal 保留几位小数
 */
export function calcRatio(
  num: number | string,
  total: number | string,
  decimal = 2
) {
  const _num = Number(num) || 0;
  const _total = Number(total) || 1;
  return (
    Math.round((_num / _total) * Math.pow(10, decimal + 2)) /
      Math.pow(10, decimal) +
    '%'
  );
}

// 数字排序 arr.sort(sortExp('code', false))
export function sortExp(key: string, isAsc: boolean) {
  return function (x: any, y: any) {
    return (x[key] - y[key]) * (isAsc ? 1 : -1);
  };
}

/**
 * 将颜色值转换为有透明度的颜色值 rgb格式
 * @param value 为带'#'的纯色格式或rgb格式
 * @param opcity 透明度
 * @returns rgb格式
 */
 export const getColorOpcity = (value: string, opcity = 1) => {
  const _value = getRGBColor(value);
  if (_value.startsWith('rgb') || _value.startsWith('RGB')) {
    const arr = _value.split(/\(|\)|,/);
    return `rgba(${arr[1]},${arr[2]},${arr[3]}, ${opcity})`;
  }
  return '';
};


/**
 * 将颜色值转换为有透明度的颜色值 rgb格式
 * @param value 为带'#'的格式
 * @returns rgb格式
 */
 export const getRGBColor = (value: string) => {
  if (value.startsWith('#') && [4, 7].includes(value.length)) {
    let _value = value.slice(1);
    if (_value.length === 3) {
      _value = _value
        .split('')
        .map((item) => `${item}${item}`)
        .join('');
    }
    const r = parseInt(_value.slice(0, 2), 16);
    const g = parseInt(_value.slice(2, 4), 16);
    const b = parseInt(_value.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b})`;
  }
  return value;
};

/**
 * 格式化users数据
 */
//
export const processing = (data: any) => {
  const firstKeys = Object.keys(data);
  const company = firstKeys.find((itme) => itme !== 'metrics');
  const sigData = data[company as string];
  return { company, sigData };
};

/**
 * 格式化Treemap数据
 */
//
export const treeProcessing = (data: any) => {
  const firstKeys = Object.keys(data);
  const company = firstKeys.find((itme) => itme !== 'metrics');
  const sigData = data[company as string];
  const sigs = sigData.map((item: any) => {
    const obj = { sig: item.sig, group: item.feature };
    data['metrics'].reduce((pre: any, next: string, index: number) => {
      pre[next] = item.value[index];
      return pre;
    }, obj);
    return obj;
  });
  return { company, sigs };
};
