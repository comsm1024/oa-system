import dayjs from 'dayjs';

export interface OvertimeRequest {
  key: string;
  employeeName: string;
  overtimeType: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  compensationType: '调休' | '加班工资' | '加班工资和调休';
  expiryDate?: string;  // 调休有效期
}

export const generateMockData = (): OvertimeRequest[] => {
  const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'];
  const overtimeTypes = ['工作日加班', '节假日加班', '周末加班'];
  const reasons = [
    '项目紧急上线',
    '系统维护升级',
    '处理生产环境问题',
    '配合客户测试',
    '数据迁移工作',
    '重要会议筹备',
    '年终盘点工作',
    '突发故障处理'
  ];
  const statuses: ('pending' | 'approved' | 'rejected')[] = ['pending', 'approved', 'rejected'];
  const compensationTypes: ('调休' | '加班工资' | '加班工资和调休')[] = ['调休', '加班工资', '加班工资和调休'];

  return Array.from({ length: 100 }, (_, index) => {
    // 生成随机日期（最近3个月内）
    const date = dayjs().subtract(Math.floor(Math.random() * 90), 'day');
    
    // 生成随机时间（工作时间后1-5小时）
    const startHour = 18 + Math.floor(Math.random() * 3);
    const duration = 1 + Math.floor(Math.random() * 4);
    const endHour = startHour + duration;

    // 生成补偿方式和调休有效期
    const compensationType = compensationTypes[Math.floor(Math.random() * compensationTypes.length)];
    const expiryDate = compensationType.includes('调休') 
      ? dayjs(date).add(3, 'month').format('YYYY-MM-DD')
      : undefined;

    return {
      key: String(index + 1),
      employeeName: names[Math.floor(Math.random() * names.length)],
      overtimeType: overtimeTypes[Math.floor(Math.random() * overtimeTypes.length)],
      date: date.format('YYYY-MM-DD'),
      startTime: `${String(startHour).padStart(2, '0')}:00`,
      endTime: `${String(endHour).padStart(2, '0')}:00`,
      duration: duration,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      compensationType,
      expiryDate,
    };
  });
}; 