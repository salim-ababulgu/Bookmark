import toast from 'react-hot-toast';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const useToast = () => {
  const showToast = (message, options = {}) => {
    const { type = 'default', duration = 5000, ...otherOptions } = options;

    const customToast = (icon, iconColor) => {
      return toast(
        (t) => (
          <div className="flex items-center space-x-3">
            <div className={`flex-shrink-0 ${iconColor}`}>
              {icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {message}
              </p>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
        ),
        {
          duration,
          style: {
            maxWidth: '400px',
            ...otherOptions.style
          },
          ...otherOptions
        }
      );
    };

    switch (type) {
      case 'success':
        return customToast(
          <CheckCircleIcon className="h-6 w-6" />,
          'text-green-500'
        );
      case 'error':
        return customToast(
          <XCircleIcon className="h-6 w-6" />,
          'text-red-500'
        );
      case 'warning':
        return customToast(
          <ExclamationTriangleIcon className="h-6 w-6" />,
          'text-yellow-500'
        );
      case 'info':
        return customToast(
          <InformationCircleIcon className="h-6 w-6" />,
          'text-blue-500'
        );
      default:
        return toast(message, { duration, ...otherOptions });
    }
  };

  const success = (message, options = {}) =>
    showToast(message, { ...options, type: 'success' });

  const error = (message, options = {}) =>
    showToast(message, { ...options, type: 'error' });

  const warning = (message, options = {}) =>
    showToast(message, { ...options, type: 'warning' });

  const info = (message, options = {}) =>
    showToast(message, { ...options, type: 'info' });

  const loading = (message, options = {}) =>
    toast.loading(message, options);

  const promise = (promise, messages) =>
    toast.promise(promise, messages);

  const dismiss = (toastId) =>
    toast.dismiss(toastId);

  const remove = (toastId) =>
    toast.remove(toastId);

  return {
    toast: showToast,
    success,
    error,
    warning,
    info,
    loading,
    promise,
    dismiss,
    remove
  };
};

export default useToast;