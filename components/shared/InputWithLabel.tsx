import { Input, InputProps } from 'react-daisyui';

interface InputWithLabelProps extends InputProps {
  label: string | React.ReactNode;
  error?: string;
  descriptionText?: string;
}

const InputWithLabel = (props: InputWithLabelProps) => {
  const { label, error, descriptionText, ...rest } = props;

  const classes = [
    'text-sm !rounded-xl !border-gray-200/80 dark:!border-zinc-800/80 focus:!ring-2 focus:!ring-orange-500/40 focus:!border-orange-500 focus:!outline-none transition-all duration-200 bg-white dark:bg-zinc-900/40'
  ];

  if (error) {
    classes.push('!input-error !border-red-500 focus:!ring-red-500/40');
  }

  return (
    <div className="form-control w-full">
      {typeof label === 'string' ? (
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
      ) : (
        label
      )}
      <Input className={classes.join(' ')} {...rest} />
      {(error || descriptionText) && (
        <label className="label">
          <span className={`label-text-alt ${error ? 'text-red-500' : ''}`}>
            {error || descriptionText}
          </span>
        </label>
      )}
    </div>
  );
};

export default InputWithLabel;
