export default function getNiceUrl(routeName: string, id: string, name: string) {
    return `/${routeName}/${id}/${name.toLowerCase().replace(/ /g, '_')}`
}
