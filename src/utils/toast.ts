let messageApi: any | null = null;

export const setMessageApi = (api: any) => {
  messageApi = api;
};

export const toastError = (content: string) => {
  if (messageApi) {
    messageApi.error(content);
  } else {
    // Fallback: avoid antd warning when no provider present
    // eslint-disable-next-line no-console
    console.error(content);
  }
};

export const toastSuccess = (content: string) => {
  if (messageApi) {
    messageApi.success(content);
  } else {
    // eslint-disable-next-line no-console
    console.log(content);
  }
};

export const toastInfo = (content: string) => {
  if (messageApi) {
    messageApi.info(content);
  } else {
    // eslint-disable-next-line no-console
    console.log(content);
  }
};


