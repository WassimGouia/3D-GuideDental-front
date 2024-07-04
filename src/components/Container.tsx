type Props = {
    children: React.ReactNode
}

const Container = ({ children }: Props) => {
    return (
        <div className="sm:w-4/6 sm:mx-auto h-[100%]">
            {children}
        </div>
    )
}

export default Container