import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
	const { fullViewport } = attributes;

	const blockProps = useBlockProps.save({
		className: fullViewport ? 'is-full-viewport' : undefined,
	});

	return (
		<div {...blockProps}>
			{/* ここにブロックコンテンツを実装 */}
		</div>
	);
}