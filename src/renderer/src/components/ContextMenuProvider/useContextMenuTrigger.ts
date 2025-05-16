import { useContextMenu } from 'react-contexify'
import { MENU_ID } from '@renderer/components/ContextMenuProvider/index'
export const useContextMenuTrigger = (): any => {
  const { show, hideAll } = useContextMenu({ id: MENU_ID })

  const handleContextMenu = (data?: any) => (event: React.MouseEvent) => {
    event.preventDefault()
    show({
      event,
      props: data
    })
  }
  return { handleContextMenu, hideAll }
}
