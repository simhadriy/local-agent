import { forwardRef } from 'react'

export const Target = forwardRef(function Target(
  { id, as: Comp = 'div', className = '', active = false, children, ...rest },
  ref,
) {
  const classes = ['target', className, active ? 'target-active' : ''].filter(Boolean).join(' ')
  return (
    <Comp ref={ref} data-target={id} className={classes} {...rest}>
      {children}
    </Comp>
  )
})
