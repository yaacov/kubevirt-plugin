import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';

export const isEmpty = (obj) =>
  [Object, Array].includes((obj || {}).constructor) && !Object.entries(obj || {}).length;

export const get = (obj: unknown, path: string | string[], defaultValue = undefined) => {
  const travel = (regexp: RegExp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res: { [x: string]: any }, key: string | number) => {
        return res !== null && res !== undefined ? res[key] : res;
      }, obj);
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
};

export const isUpstream = (window as any).SERVER_FLAGS?.branding === 'okd';

export const isString = (val: unknown) => val !== null && typeof val === 'string';

export const getSSHNodePort = (sshService: IoK8sApiCoreV1Service) =>
  sshService?.spec?.ports?.find((port) => parseInt(port.targetPort, 10) === 22)?.nodePort;

export const isTemplateParameter = (value: string): boolean =>
  Boolean(/^\${[A-z0-9_]+}$/.test(value));

export const getRandomChars = (len = 6): string => {
  return Math.random()
    .toString(36)
    .replace(/[^a-z0-9]+/g, '')
    .substr(1, len);
};

export const SSH_PUBLIC_KEY_VALIDATION_REGEX =
  /^(sk-)?(ssh-rsa AAAAB3NzaC1yc2|ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNT|ecdsa-sha2-nistp384 AAAAE2VjZHNhLXNoYTItbmlzdHAzODQAAAAIbmlzdHAzOD|ecdsa-sha2-nistp521 AAAAE2VjZHNhLXNoYTItbmlzdHA1MjEAAAAIbmlzdHA1Mj|ssh-ed25519 AAAAC3NzaC1lZDI1NTE5|ssh-dss AAAAB3NzaC1kc3)[0-9A-Za-z+/]+[=]{0,3}( .*)?$/;

export const validateSSHPublicKey = (value: string): boolean => {
  const trimmedValue = value?.trim();
  return isEmpty(trimmedValue) || Boolean(SSH_PUBLIC_KEY_VALIDATION_REGEX?.test(trimmedValue));
};

export const getContentScrollableElement = (): HTMLElement =>
  document.getElementById('content-scrollable');

export const findAllIndexes = <T>(
  array: T[],
  predicate: (element: T, index: number, array: T[]) => boolean,
): number[] =>
  Array.from(array.entries()).reduce<number[]>(
    (acc, [index, element]) => (predicate(element, index, array) ? [...acc, index] : acc),
    [],
  );
