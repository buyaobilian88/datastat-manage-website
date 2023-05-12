import { request } from '@/shared/axios';
import type { AxiosResponse } from '@/shared/axios';

/**
 * 查询社区贡献
 *
 */
 export function queryAll(name: string) {
  const url = `/api/query/all?community=${name}`;
  return request.get(url).then((res: AxiosResponse) => res.data);
}

