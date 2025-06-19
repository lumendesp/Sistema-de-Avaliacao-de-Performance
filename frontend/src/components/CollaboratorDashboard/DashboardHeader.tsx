import UserBadge from './UserBadge';

interface Props {
  name: string;
}

const DashboardHeader = ({ name }: Props) => {
  return (
    <div className="w-full flex items-center justify-between mb-6 pb-0">
      <h3 className="text-lg font-semibold text-gray-800">Olá, {name}</h3>
      <UserBadge name={name} />
    </div>
  );
};

export default DashboardHeader;
