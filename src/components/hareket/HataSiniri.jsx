import { Component } from 'react'

// 3D sahnelerde bir hata olursa sayfanın geri kalanı çökmesin: yalnızca o parça boş kalır.
export default class HataSiniri extends Component {
    constructor(props) {
        super(props)
        this.state = { hata: false }
    }

    static getDerivedStateFromError() {
        return { hata: true }
    }

    componentDidCatch(hata) {
        console.error('3D sahne hatası:', hata)
        this.props.onHata?.()
    }

    render() {
        return this.state.hata ? (this.props.yedek ?? null) : this.props.children
    }
}
