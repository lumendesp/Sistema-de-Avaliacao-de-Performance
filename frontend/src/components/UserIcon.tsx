type UserIconProps = {
  initials: string
  size?: number
}

export function UserIcon({ initials, size = 40 }: UserIconProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className="bg-[#E2E8F0] rounded-full flex items-center justify-center text-[#0F172A] font-normal text-base"
    >
      {initials}
    </div>
  )
}
