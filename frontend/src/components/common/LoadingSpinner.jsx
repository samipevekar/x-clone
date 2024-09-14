const LoadingSpinner = ({ size = "md" }) => {
	const sizeClass = `loading-${size}`;

	return <span className={`loading m-auto h-auto loading-spinner ${sizeClass}`} />;
};
export default LoadingSpinner;